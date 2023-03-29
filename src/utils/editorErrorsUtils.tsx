import * as ReactDOM from 'react-dom';
import { Cell } from '@jupyterlab/cells';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';
import React from 'react';
import CellErrorDropdown from '../components/CellErrorDropdown';
import {
  Issue,
  CellType,
  isLineCellIssue,
  isDataframeCellIssue,
  isAggregateCellIssue
} from '../types';
import { MarkerRange, TextMarker } from 'codemirror';

const CELL_INPUT_WRAPPER_CLASS = 'jp-Cell-inputWrapper';
const CELL_INPUT_ERROR_CLASS = 'nbdefense-cell-input-error';

const CELL_OUTPUT_OUTPUT_AREA_CLASS = 'jp-OutputArea-output';

const CELL_COLLAPSER_CLASS = 'jp-Collapser';
const CELL_COLLAPSER_ERROR_CLASS = 'nbdefense-cell-input-collapser-error';

const MARKS_CLASS = 'nbdefense-syntax-error';
const CELL_HIGHLIGHT_CLASS = 'nbdefense-table-error';

/**
 * Adds error highlighting to a cell
 *
 * @param notebookIssues An array of Issue objects to pass to the CellErrorDropdown component
 * @param cell The html element to highlight
 * @returns A tuple containing a react portal for the detailed error description component and an array of codemirror marks for each issue in the cell
 */
export const addErrorHighlightingToCell = (
  notebookIssues: Array<Issue>,
  cell: Cell | undefined,
  isContextualHelpVisible?: boolean,
  isNBDefenseDropdownVisible?: boolean
): [
  React.ReactPortal | undefined,
  Array<TextMarker<MarkerRange> | (() => void) | undefined> | undefined
] => {
  const cellInput = cell?.node.getElementsByClassName(CELL_INPUT_WRAPPER_CLASS);
  if (cellInput && cellInput.length > 0) {
    // add highlight classes
    if (isContextualHelpVisible !== false) {
      cellInput[0].classList.add(CELL_INPUT_ERROR_CLASS);

      const collapser =
        cellInput[0].getElementsByClassName(CELL_COLLAPSER_CLASS);
      if (collapser && collapser.length > 0) {
        collapser[0].classList.add(CELL_COLLAPSER_ERROR_CLASS);
      }
    }

    // add red underline
    const issuesByCellType = getIssuesByCellType(notebookIssues);

    const cellOutputs = cell?.node.getElementsByClassName(
      CELL_OUTPUT_OUTPUT_AREA_CLASS
    );

    const marksAndResetCellOutputFunctions =
      isContextualHelpVisible !== false
        ? Object.entries(issuesByCellType)
            .map(([cellType, issues]) => {
              const allIssues: Array<Issue> = issues.flatMap(issue =>
                isAggregateCellIssue(issue) ? issue.issues : issue
              );

              if (
                cellType === CellType.SOURCE ||
                cellType === CellType.MARKDOWN
              ) {
                return allIssues.map((issue: Issue) =>
                  addUnderlineToCellInput(cell, issue)
                );
              }

              if (
                cellType === CellType.STREAM ||
                cellType === CellType.PLAINTEXT
              ) {
                return addUnderlineToTextCellOutput(
                  cellOutputs,
                  cellType,
                  allIssues
                );
              }

              if (cellType === CellType.DATAFRAME) {
                return addUnderlineToDataframeCellOutput(cell, allIssues);
              }
            })
            .flat()
        : undefined;

    // add cell error dropdown
    const portal =
      isNBDefenseDropdownVisible !== false
        ? ReactDOM.createPortal(
            <CellErrorDropdown notebookIssues={notebookIssues} />,
            cellInput[0]
          )
        : undefined;

    return [portal, marksAndResetCellOutputFunctions];
  }
  return [undefined, undefined];
};

export const clearErrorHighlighting = (
  cells: readonly Cell[],
  marks: Array<TextMarker | (() => void) | undefined>
): void => {
  cells.forEach(cell => {
    const cellInput = cell.node.getElementsByClassName(
      CELL_INPUT_WRAPPER_CLASS
    );
    if (cellInput && cellInput.length > 0) {
      cellInput[0].classList.remove(CELL_INPUT_ERROR_CLASS);

      const collapser =
        cellInput[0].getElementsByClassName(CELL_COLLAPSER_CLASS);
      if (collapser && collapser.length > 0) {
        collapser[0].classList.remove(CELL_COLLAPSER_ERROR_CLASS);
      }
    }
  });

  marks.forEach(markOrResetFunction => {
    if (markOrResetFunction) {
      if (typeof markOrResetFunction !== 'function') {
        // has to be a mark
        markOrResetFunction.clear();
      } else {
        markOrResetFunction();
      }
    }
  });
};

const addUnderlineToCellInput = (
  cell: Cell | undefined,
  issue: Issue
): TextMarker<MarkerRange> | undefined => {
  const editor = cell?.editor as CodeMirrorEditor;
  if (editor && isLineCellIssue(issue)) {
    const mark = editor.doc.markText(
      { line: issue.line_index, ch: issue.character_start_index },
      { line: issue.line_index, ch: issue.character_end_index },
      {
        className: MARKS_CLASS,
        title: 'NB Defense scan issue detected',
        clearOnEnter: true
      }
    );
    return mark;
  }
};

const addUnderlineToTextCellOutput = (
  cellOutputs: HTMLCollectionOf<Element> | undefined,
  cellType: CellType,
  issues: Array<Issue>
): Array<(() => void) | undefined> | undefined => {
  const issuesByOutputIndex: { [key: string]: Array<Issue> } = {};
  issues.forEach((issue: Issue) => {
    const outputIndex =
      'output_index' in issue.cell ? issue.cell.output_index : 0;
    if (issuesByOutputIndex[outputIndex]) {
      issuesByOutputIndex[outputIndex].push(issue);
    } else {
      issuesByOutputIndex[outputIndex] = [issue];
    }
  });

  const result = Object.entries(issuesByOutputIndex).map(
    ([outputIndex, subIssues]) => {
      const cellOutput = getCellOutputElementFromCellType(
        cellOutputs,
        cellType,
        Number(outputIndex)
      );

      if (cellOutput) {
        const originalInnerHTML = cellOutput?.innerHTML;

        const valueWrapper = cellOutput?.querySelectorAll('pre')[0];
        if (valueWrapper) {
          const lineOffset: { [lineNumber: number]: number } = {};
          let finalOutputText = valueWrapper.textContent || '';
          const lines = finalOutputText.split('\n') || [];

          subIssues.forEach(issue => {
            if (isLineCellIssue(issue)) {
              let currentOffset = 0;

              if (issue.line_index in lineOffset) {
                currentOffset = lineOffset[issue.line_index];
              }

              const issueValueSubstring = lines[issue.line_index].substring(
                issue.character_start_index + currentOffset,
                issue.character_end_index + currentOffset
              );

              const previousTextLength = finalOutputText.length;

              lines[issue.line_index] = `${lines[issue.line_index].substring(
                0,
                issue.character_start_index + currentOffset
              )}<span class='${MARKS_CLASS}'>${issueValueSubstring}</span>${lines[
                issue.line_index
              ].substring(issue.character_end_index + currentOffset)}`;

              finalOutputText = lines.join('\n');

              currentOffset += finalOutputText.length - previousTextLength;

              lineOffset[issue.line_index] = currentOffset;
            }
          });

          valueWrapper.innerHTML = finalOutputText;
        }
        return () => {
          cellOutput.innerHTML = originalInnerHTML;
        };
      }
    }
  );
  return result;
};

const addUnderlineToDataframeCellOutput = (
  cell: Cell | undefined,
  issues: Array<Issue>
): (() => void) | undefined => {
  const cellOutputs = cell?.node.getElementsByClassName(
    CELL_OUTPUT_OUTPUT_AREA_CLASS
  );

  const cellOutput = getCellOutputElementFromCellType(
    cellOutputs,
    CellType.DATAFRAME
  );

  if (cellOutput) {
    const originalInnerHTML = cellOutput.innerHTML;

    issues.forEach(issue => {
      if (isDataframeCellIssue(issue)) {
        const dataframeTables = cellOutput.querySelectorAll('table.dataframe');
        const { row_index: rowNumber, column_index: columnNumber } = issue;

        const dataframeBodyRows =
          dataframeTables[0].querySelectorAll('tbody > tr');
        const dataframeHeaderRows =
          dataframeTables[0].querySelectorAll('thead > tr');
        // Some dataframes have headers as well so count the number of rows in the header
        let issueCell;
        // if row is in table header
        if (rowNumber < dataframeHeaderRows.length) {
          issueCell = dataframeHeaderRows[rowNumber].children.item(
            columnNumber + 1
          );
        }
        // if row is in table body
        else {
          issueCell = dataframeBodyRows[
            rowNumber - dataframeHeaderRows.length
          ].children.item(columnNumber + 1);
        }
        issueCell?.classList.add(CELL_HIGHLIGHT_CLASS);
      }
    });

    return () => {
      cellOutput.innerHTML = originalInnerHTML;
    };
  }
};

const getIssuesByCellType = (
  issues: Array<Issue>
): { [cellType in CellType]: Array<Issue> } => {
  const issuesByCellType: { [cellType in CellType]: Array<Issue> } = {
    [CellType.SOURCE]: [],
    [CellType.MARKDOWN]: [],
    [CellType.STREAM]: [],
    [CellType.PLAINTEXT]: [],
    [CellType.DATAFRAME]: []
  };

  issues.forEach(issue => {
    issuesByCellType[issue.cell.cell_type].push(issue);
  });

  return issuesByCellType;
};

const getCellOutputElementFromCellType = (
  cellOutputs: HTMLCollectionOf<Element> | undefined,
  cellType: CellType,
  outputIndex = 0
): Element | undefined => {
  if (cellOutputs) {
    for (const cellOutput of Array.from(cellOutputs)) {
      const mimeType = cellOutput.getAttributeNode('data-mime-type')?.value;

      if (cellType === CellType.PLAINTEXT && mimeType === 'text/plain') {
        return cellOutput;
      }

      if (
        cellType === CellType.STREAM &&
        mimeType === 'application/vnd.jupyter.stdout'
      ) {
        if (!outputIndex) {
          return cellOutput;
        }
      }

      if (cellType === CellType.DATAFRAME && mimeType === 'text/html') {
        const dataframeTables = cellOutput.querySelectorAll('table.dataframe');
        if (dataframeTables.length > 0) {
          return cellOutput;
        }
      }
      outputIndex--;
    }
  }
};
