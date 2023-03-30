import {
  INotebookTracker,
  Notebook,
  NotebookPanel
} from '@jupyterlab/notebook';
import { TextMarker } from 'codemirror';
import React from 'react';
import useEventCallback from 'use-event-callback';
import { Report, ReportError, ScanError, ScanErrorType } from '../types';
import {
  addErrorHighlightingToCell,
  clearErrorHighlighting
} from '../utils/editorErrorsUtils';
import { getIssuesByCell } from '../utils/issueUtils';
import { ISSUE_LINK_URL, ISSUE_LINK_TEXT } from '../constants';

export type ScanResult = {
  notebook: Notebook;
  report?: Report;
  portals: Array<React.ReactPortal | undefined>;
  // marks can be:
  // 1) a text marker (issue in cell input)
  // OR
  // 2) a function to reset the innerHTML of an output object (issue in cell output)
  marks: Array<TextMarker | (() => void) | undefined>;
  isDirty: boolean;
  isLoading: boolean;
  isOpen: boolean;
  hasRenderedResults: boolean;
  lastUpdated?: Date;
  error?: Array<ScanError | ReportError>;
};

export type ScanResultsState = {
  [notebookPath: string]: ScanResult;
};

export type ScanResultDispatchAction =
  | {
      notebookPath: string;
      type: 'report' | 'isDirty' | 'loading' | 'error' | 'isOpen';
      notebook?: Notebook;
      report?: Report;
      isDirty?: boolean;
      isOpen?: boolean;
      error?: Array<ScanError | ReportError>;
    }
  | { type: 'clearAllReports' }
  | {
      type: 'hasRenderedReport';
      notebookPath: string;
      portals: Array<React.ReactPortal | undefined>;
      marks: Array<TextMarker | (() => void) | undefined>;
    }
  | { type: 'clearPortalsAndMarks'; notebookPath: string }
  | {
      type: 'onVisibleInformationChanged';
      notebookPath: string;
      isContextualHelpVisible: boolean;
      isNBDefenseDropdownVisible: boolean;
    };

/**
 * Keeps track of the current scan results and updates the notebook ui
 * @returns The scan result state and dispatch method
 */
export const useScanResults = ({
  notebookTracker,
  isContextualHelpVisible,
  isNBDefenseDropdownVisible
}: {
  notebookTracker: INotebookTracker;
  isContextualHelpVisible: boolean;
  isNBDefenseDropdownVisible: boolean;
}): [ScanResultsState, React.Dispatch<ScanResultDispatchAction>] => {
  const [state, dispatch] = React.useReducer(reducer, {});

  const updateIsOpen = useEventCallback(
    async (notebookTracker: INotebookTracker, notebookPanel: NotebookPanel) => {
      const notebookPath = notebookPanel.context.path;

      if (notebookPath in state) {
        await notebookPanel.revealed;
        dispatch({
          notebookPath,
          type: 'isOpen',
          isOpen: true,
          notebook: notebookPanel.content
        });
      }
    }
  );

  React.useEffect(() => {
    notebookTracker.widgetAdded.disconnect(updateIsOpen);
    notebookTracker.widgetAdded.connect(updateIsOpen);
  }, [notebookTracker, state]);

  React.useEffect(() => {
    Object.entries(state).map(([notebookPath, results]) => {
      try {
        results.notebook.disposed.connect(() => {
          dispatch({ notebookPath, type: 'isOpen', isOpen: false });
        });

        if (results.isOpen) {
          const report = results.report;
          if (!results.hasRenderedResults && report) {
            const cells = results.notebook.widgets;

            clearErrorHighlighting(cells, results.marks);
            dispatch({ notebookPath, type: 'clearPortalsAndMarks' });

            const { new_portals, new_marks } = Object.entries(
              getIssuesByCell(report.notebook_issues[0].issues)
            )
              .map(([cell_number, issues]) => {
                const [portal, cell_marks] = addErrorHighlightingToCell(
                  issues,
                  cells[parseInt(cell_number)],
                  isContextualHelpVisible,
                  isNBDefenseDropdownVisible
                );
                return { portal, cell_marks };
              })
              .reduce(
                (
                  {
                    new_portals,
                    new_marks
                  }: {
                    new_portals: Array<React.ReactPortal | undefined>;
                    new_marks: Array<TextMarker | (() => void) | undefined>;
                  },
                  { portal, cell_marks }
                ) => {
                  new_portals.push(portal);
                  cell_marks?.forEach(mark => new_marks.push(mark));
                  return { new_portals, new_marks };
                },
                { new_portals: [], new_marks: [] }
              );

            dispatch({
              notebookPath,
              type: 'hasRenderedReport',
              portals: new_portals,
              marks: new_marks
            });
          } else if (results.isLoading) {
            if (
              state[notebookPath] &&
              (state[notebookPath].marks.length !== 0 ||
                state[notebookPath].portals.length !== 0)
            ) {
              const cells = results.notebook.widgets;

              clearErrorHighlighting(cells, results.marks);
              dispatch({ notebookPath, type: 'clearPortalsAndMarks' });
            }
          }
        }
      } catch (error) {
        dispatch({
          notebookPath,
          type: 'error',
          error: [
            {
              message: `<span>There was an issue scanning this notebook. Please create an issue here: <a class="nbdefense-error-link" href=${ISSUE_LINK_URL} target="_blank">${ISSUE_LINK_TEXT}</a></span>`,
              statusCode: 400,
              errorType: ScanErrorType.UNKNOWN_ISSUE,
              notebookPath: notebookPath
            }
          ]
        });
      }
    });
  }, [state]);

  React.useEffect(() => {
    Object.entries(state).map(([notebookPath, results]) => {
      try {
        results.notebook.disposed.connect(() => {
          dispatch({ notebookPath, type: 'isOpen', isOpen: false });
        });

        if (results.isOpen) {
          const report = results.report;
          if (report) {
            const cells = results.notebook.widgets;

            clearErrorHighlighting(cells, results.marks);
            dispatch({ notebookPath, type: 'clearPortalsAndMarks' });

            const { new_portals, new_marks } = Object.entries(
              getIssuesByCell(report.notebook_issues[0].issues)
            )
              .map(([cell_number, issues]) => {
                const [portal, cell_marks] = addErrorHighlightingToCell(
                  issues,
                  cells[parseInt(cell_number)],
                  isContextualHelpVisible,
                  isNBDefenseDropdownVisible
                );
                return { portal, cell_marks };
              })
              .reduce(
                (
                  {
                    new_portals,
                    new_marks
                  }: {
                    new_portals: Array<React.ReactPortal | undefined>;
                    new_marks: Array<TextMarker | (() => void) | undefined>;
                  },
                  { portal, cell_marks }
                ) => {
                  new_portals.push(portal);
                  cell_marks?.forEach(mark => new_marks.push(mark));
                  return { new_portals, new_marks };
                },
                { new_portals: [], new_marks: [] }
              );

            dispatch({
              notebookPath,
              type: 'hasRenderedReport',
              portals: new_portals,
              marks: new_marks
            });
          }
        }
      } catch (error) {
        dispatch({
          notebookPath,
          type: 'error',
          error: [
            {
              message: `<span>There was an issue scanning this notebook. Please create an issue here: <a class="nbdefense-error-link" href=${ISSUE_LINK_URL} target="_blank">${ISSUE_LINK_TEXT}</a></span>`,
              statusCode: 400,
              errorType: ScanErrorType.UNKNOWN_ISSUE,
              notebookPath: notebookPath
            }
          ]
        });
      }
    });
  }, [isContextualHelpVisible, isNBDefenseDropdownVisible]);

  return [state, dispatch];
};

const reducer = (
  state: ScanResultsState,
  dispatchAction: ScanResultDispatchAction
): ScanResultsState => {
  if (dispatchAction.type === 'loading') {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        isLoading: true,
        notebook:
          dispatchAction.notebook ||
          state[dispatchAction.notebookPath].notebook,
        report: undefined,
        portals: state[dispatchAction.notebookPath]?.portals || [],
        marks: state[dispatchAction.notebookPath]?.marks || [],
        isDirty: false,
        isOpen: true,
        hasRenderedResults: false,
        lastUpdated: state[dispatchAction.notebookPath]?.lastUpdated,
        error: undefined
      }
    };
  }

  if (dispatchAction.type === 'report' && dispatchAction.report) {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        report: dispatchAction.report,
        notebook: state[dispatchAction.notebookPath].notebook,
        portals: state[dispatchAction.notebookPath].portals,
        marks: state[dispatchAction.notebookPath].marks,
        isDirty: state[dispatchAction.notebookPath]?.isDirty,
        isOpen: state[dispatchAction.notebookPath].isOpen,
        hasRenderedResults: false,
        isLoading: false,
        lastUpdated: new Date(),
        error: dispatchAction.report.errors
      }
    };
  }

  if (
    dispatchAction.type === 'isDirty' &&
    dispatchAction.isDirty !== undefined &&
    dispatchAction.notebookPath in state
  ) {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        ...state[dispatchAction.notebookPath],
        isDirty: dispatchAction.isDirty
      }
    };
  }

  if (
    dispatchAction.type === 'isOpen' &&
    dispatchAction.isOpen !== undefined &&
    dispatchAction.notebookPath in state
  ) {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        ...state[dispatchAction.notebookPath],
        isOpen: dispatchAction.isOpen,
        notebook:
          dispatchAction.notebook || state[dispatchAction.notebookPath].notebook
      }
    };
  }

  if (dispatchAction.type === 'hasRenderedReport') {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        ...state[dispatchAction.notebookPath],
        portals: dispatchAction.portals,
        marks: dispatchAction.marks,
        hasRenderedResults: true
      }
    };
  }

  if (dispatchAction.type === 'error') {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        ...state[dispatchAction.notebookPath],
        isLoading: false,
        error: dispatchAction.error
      }
    };
  }

  if (dispatchAction.type === 'clearPortalsAndMarks') {
    return {
      ...state,
      [dispatchAction.notebookPath]: {
        ...state[dispatchAction.notebookPath],
        portals: [],
        marks: []
      }
    };
  }

  if (dispatchAction.type === 'clearAllReports') {
    Object.values(state).forEach(scanResult => {
      const cells = scanResult.notebook.widgets;
      clearErrorHighlighting(cells, scanResult.marks);
    });
    return {};
  }

  return { ...state };
};
