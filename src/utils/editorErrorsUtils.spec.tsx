import React from 'react';
import { addErrorHighlightingToCell } from './editorErrorsUtils';
import { Cell } from '@jupyterlab/cells';
import {
  CellType,
  IssueCode,
  IssueLocation,
  LineCellIssue,
  Severity
} from '../types';

const CELL_INPUT_WRAPPER_CLASS = 'jp-Cell-inputWrapper';
const CELL_INPUT_ERROR_CLASS = 'nbdefense-cell-input-error';

const CELL_OUTPUT_OUTPUT_AREA_CLASS = 'jp-OutputArea-output';

const CELL_COLLAPSER_CLASS = 'jp-Collapser';
const CELL_COLLAPSER_ERROR_CLASS = 'nbdefense-cell-input-collapser-error';

const MARKS_CLASS = 'nbdefense-syntax-error';

describe('editorErrorsUtils', () => {
  describe('addErrorHighlightingToCell', () => {
    beforeEach(() => {
      jest.mock('../components/CellErrorDropdown', () => ({
        __esModule: true,
        CellErrorDropdown: function MockCellErrorDropdown() {
          return <></>;
        }
      }));
    });

    describe('when there are no cellInput elements or cell is undefined', () => {
      const mockCell: Cell = {
        node: document.createElement('div')
      } as unknown as Cell;

      it('should return [undefined, undefined]', () => {
        expect(addErrorHighlightingToCell([], undefined)).toEqual([
          undefined,
          undefined
        ]);

        expect(addErrorHighlightingToCell([], mockCell)).toEqual([
          undefined,
          undefined
        ]);
      });
    });

    describe('when there are cellInput elements', () => {
      let mockCellHTMLElement: HTMLDivElement;
      let mockCell: Cell;

      beforeEach(() => {
        mockCellHTMLElement = document.createElement('div');
        mockCellHTMLElement.innerHTML = `<div class="${CELL_INPUT_WRAPPER_CLASS}">
          <div class="${CELL_COLLAPSER_CLASS}"></div>
        </div>`;
        mockCell = {
          node: mockCellHTMLElement
        } as unknown as Cell;
      });

      it('should add the highlight classes', () => {
        addErrorHighlightingToCell([], mockCell);

        expect(
          mockCell.node
            .getElementsByClassName(CELL_INPUT_WRAPPER_CLASS)[0]
            .classList.contains(CELL_INPUT_ERROR_CLASS)
        ).toBe(true);

        expect(
          mockCell.node
            .getElementsByClassName(CELL_COLLAPSER_CLASS)[0]
            .classList.contains(CELL_COLLAPSER_ERROR_CLASS)
        ).toBe(true);
      });

      it('should add the underline to cell inputs', () => {
        const character_start_index = 1;
        const character_end_index = 2;
        const line_index = 4;

        const issues: Array<LineCellIssue> = [
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.INPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.SOURCE,
              scrubbed_content: ''
            },
            details: {},
            character_start_index,
            character_end_index,
            line_index
          }
        ];

        const mockMarkTextFunction = jest.fn();
        (mockCell as any).editor = {
          doc: {
            markText: mockMarkTextFunction
          }
        };

        addErrorHighlightingToCell(issues, mockCell);

        expect(mockMarkTextFunction).toHaveBeenCalledTimes(1);

        expect(mockMarkTextFunction).toHaveBeenCalledWith(
          { line: line_index, ch: character_start_index },
          { line: line_index, ch: character_end_index },
          {
            className: MARKS_CLASS,
            title: 'NB Defense scan issue detected',
            clearOnEnter: true
          }
        );
      });
    });

    describe('when there are cellOutput elements', () => {
      let mockCellHTMLElement: HTMLDivElement;
      let mockCell: Cell;

      const innerTextPlaintextOutput =
        'This is the text of the plaintext output';
      const innerTextStreamOutput = 'This is the text of the stream output';

      beforeEach(() => {
        mockCellHTMLElement = document.createElement('div');
        mockCellHTMLElement.innerHTML = `<div class="${CELL_INPUT_WRAPPER_CLASS}">
          <div class="${CELL_COLLAPSER_CLASS}"></div>
          <div class="${CELL_OUTPUT_OUTPUT_AREA_CLASS}" data-mime-type="text/plain">
            <pre>${innerTextPlaintextOutput}</pre>
          </div>
          <div class="${CELL_OUTPUT_OUTPUT_AREA_CLASS}" data-mime-type="application/vnd.jupyter.stdout">
            <pre>${innerTextStreamOutput}</pre>
          </div>
        </div>`;

        mockCell = {
          node: mockCellHTMLElement
        } as unknown as Cell;
      });

      describe('when there is one issue per cell_type', () => {
        const character_start_index = 1;
        const character_end_index = 4;
        const line_index = 0;

        const mockIssues = [
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.PLAINTEXT,
              scrubbed_content: ''
            },
            details: {},
            character_start_index,
            character_end_index,
            line_index
          } as LineCellIssue,
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.STREAM,
              scrubbed_content: ''
            },
            details: {},
            character_start_index,
            character_end_index,
            line_index
          } as LineCellIssue
        ];

        const underlinedPlaintextOutput = `T<span class="${MARKS_CLASS}">his</span> is the text of the plaintext output`;
        const underlinedStreamOutput = `T<span class="${MARKS_CLASS}">his</span> is the text of the stream output`;

        it('should add the underline to plaintext lineCellIssues', () => {
          addErrorHighlightingToCell(mockIssues, mockCell);

          const plaintextCellOutput = Array.from(
            mockCell.node.getElementsByClassName(CELL_OUTPUT_OUTPUT_AREA_CLASS)
          )
            .find(
              element =>
                element.getAttributeNode('data-mime-type')?.value ===
                'text/plain'
            )
            ?.querySelector('pre')?.innerHTML;
          expect(plaintextCellOutput).toEqual(underlinedPlaintextOutput);
        });

        it('should add the underline to stream lineCellIssues', () => {
          addErrorHighlightingToCell(mockIssues, mockCell);

          const streamCellOutput = Array.from(
            mockCell.node.getElementsByClassName(CELL_OUTPUT_OUTPUT_AREA_CLASS)
          )
            .find(
              element =>
                element.getAttributeNode('data-mime-type')?.value ===
                'application/vnd.jupyter.stdout'
            )
            ?.querySelector('pre')?.innerHTML;
          expect(streamCellOutput).toEqual(underlinedStreamOutput);
        });

        it('should return a function to reset the innerHTML value', () => {
          const [, resetFunctions] = addErrorHighlightingToCell(
            mockIssues,
            mockCell
          );

          if (resetFunctions) {
            resetFunctions.forEach(resetFunction => {
              if (resetFunction instanceof Function) {
                resetFunction();
              }
            });
          }

          const streamCellOutput = Array.from(
            mockCell.node.getElementsByClassName(CELL_OUTPUT_OUTPUT_AREA_CLASS)
          )
            .find(
              element =>
                element.getAttributeNode('data-mime-type')?.value ===
                'application/vnd.jupyter.stdout'
            )
            ?.querySelector('pre')?.innerHTML;
          expect(streamCellOutput).toEqual(innerTextStreamOutput);
        });
      });

      describe('when there are multiple issues per cell_type', () => {
        const first_character_start_index = 1;
        const first_character_end_index = 4;
        // Second set tests that multiple on the same line will work
        const second_character_start_index = 8;
        const second_character_end_index = 12;
        // Third set tests that multiple that have the same characters will work
        const third_character_start_index = 20;
        const third_character_end_index = 24;
        const line_index = 0;

        const mockIssues = [
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.PLAINTEXT,
              scrubbed_content: ''
            },
            details: {},
            character_start_index: first_character_start_index,
            character_end_index: first_character_end_index,
            line_index
          } as LineCellIssue,
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.PLAINTEXT,
              scrubbed_content: ''
            },
            details: {},
            character_start_index: second_character_start_index,
            character_end_index: second_character_end_index,
            line_index
          } as LineCellIssue,
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.PLAINTEXT,
              scrubbed_content: ''
            },
            details: {},
            character_start_index: third_character_start_index,
            character_end_index: third_character_end_index,
            line_index
          } as LineCellIssue,
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.STREAM,
              scrubbed_content: ''
            },
            details: {},
            character_start_index: first_character_start_index,
            character_end_index: first_character_end_index,
            line_index
          } as LineCellIssue,
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.STREAM,
              scrubbed_content: ''
            },
            details: {},
            character_start_index: second_character_start_index,
            character_end_index: second_character_end_index,
            line_index
          } as LineCellIssue,
          {
            code: IssueCode.SECRETS,
            location: IssueLocation.OUTPUT,
            severity: Severity.HIGH,
            cell: {
              cell_index: 1,
              cell_type: CellType.STREAM,
              scrubbed_content: ''
            },
            details: {},
            character_start_index: third_character_start_index,
            character_end_index: third_character_end_index,
            line_index
          } as LineCellIssue
        ];

        const underlinedPlaintextOutput = `T<span class="${MARKS_CLASS}">his</span> is <span class="${MARKS_CLASS}">the </span>text of <span class="${MARKS_CLASS}">the </span>plaintext output`;
        const underlinedStreamOutput = `T<span class="${MARKS_CLASS}">his</span> is <span class="${MARKS_CLASS}">the </span>text of <span class="${MARKS_CLASS}">the </span>stream output`;
        it('should add the underline to plaintext lineCellIssues', () => {
          addErrorHighlightingToCell(mockIssues, mockCell);

          const plaintextCellOutput = Array.from(
            mockCell.node.getElementsByClassName(CELL_OUTPUT_OUTPUT_AREA_CLASS)
          )
            .find(
              element =>
                element.getAttributeNode('data-mime-type')?.value ===
                'text/plain'
            )
            ?.querySelector('pre')?.innerHTML;
          expect(plaintextCellOutput).toEqual(underlinedPlaintextOutput);
        });

        it('should add the underline to stream lineCellIssues', () => {
          addErrorHighlightingToCell(mockIssues, mockCell);

          const streamCellOutput = Array.from(
            mockCell.node.getElementsByClassName(CELL_OUTPUT_OUTPUT_AREA_CLASS)
          )
            .find(
              element =>
                element.getAttributeNode('data-mime-type')?.value ===
                'application/vnd.jupyter.stdout'
            )
            ?.querySelector('pre')?.innerHTML;
          expect(streamCellOutput).toEqual(underlinedStreamOutput);
        });
      });
    });
  });
});
