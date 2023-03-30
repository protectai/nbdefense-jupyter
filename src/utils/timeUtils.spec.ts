import { Notebook } from '@jupyterlab/notebook';
import { ScanResultsState } from '../hooks/useScanResults';
import {
  getFormattedLastUpdatedTime,
  getTimestampLastUpdatedTime
} from './timeUtils';

const dateString = 'December 17, 1995 03:24:00';

describe('timeUtils', () => {
  const notebookPath = 'path/to/notebook.ipynb';
  describe('getFormattedLastUpdatedTime', () => {
    describe("when the notebook path isn't in the results state object", () => {
      it('should return "Never scanned"', () => {
        const currentTime = new Date(dateString);
        const scanResultsState: ScanResultsState = {};

        const actual = getFormattedLastUpdatedTime(
          currentTime,
          scanResultsState,
          notebookPath
        );

        expect(actual).toBe('Never scanned');
      });
    });

    describe('when the notebook path is in the results state object', () => {
      let scanResultsState: ScanResultsState;
      let currentTime: Date;

      beforeEach(() => {
        scanResultsState = {
          [notebookPath]: {
            notebook: {} as Notebook,
            portals: [],
            marks: [],
            isDirty: false,
            isLoading: false,
            isOpen: true,
            hasRenderedResults: false
          }
        };

        currentTime = new Date(dateString);
      });

      describe('when the lastUpdated time is less than a minute before the current time', () => {
        beforeEach(() => {
          scanResultsState[notebookPath].lastUpdated = new Date(
            currentTime.getTime() - 1000 * 40
          );
        });

        it('should return "Just now"', () => {
          expect(
            getFormattedLastUpdatedTime(
              currentTime,
              scanResultsState,
              notebookPath
            )
          ).toBe('Just now');
        });
      });

      describe('when the lastUpdated time is a minute or more before the current time', () => {
        beforeEach(() => {
          scanResultsState[notebookPath].lastUpdated = new Date(
            currentTime.getTime() - 1000 * 60
          );
        });

        it('should return the formatted timestamp', () => {
          expect(
            getFormattedLastUpdatedTime(
              currentTime,
              scanResultsState,
              notebookPath
            )
          ).toBe(getTimestampLastUpdatedTime(scanResultsState, notebookPath));
        });
      });
    });
  });

  describe('getTimestampLastUpdatedTime', () => {
    describe('when the notebook and last updated is present', () => {
      let scanResultsState: ScanResultsState;

      beforeEach(() => {
        scanResultsState = {
          [notebookPath]: {
            notebook: {} as Notebook,
            portals: [],
            marks: [],
            isDirty: false,
            isLoading: false,
            isOpen: true,
            hasRenderedResults: false,
            lastUpdated: new Date(dateString)
          }
        };
      });

      it('should return the formatted string', () => {
        expect(
          getTimestampLastUpdatedTime(scanResultsState, notebookPath)
        ).toBe('12/17/95 03:24:00 AM');
      });
    });

    describe('when the notebook or last updated are not present', () => {
      let scanResultsState: ScanResultsState;

      beforeEach(() => {
        scanResultsState = {
          [notebookPath]: {
            notebook: {} as Notebook,
            portals: [],
            marks: [],
            isDirty: false,
            isLoading: false,
            isOpen: true,
            hasRenderedResults: false
          }
        };
      });

      it('should return an empty string', () => {
        expect(getTimestampLastUpdatedTime(scanResultsState)).toBe('');
        expect(
          getTimestampLastUpdatedTime(scanResultsState, notebookPath)
        ).toBe('');
      });
    });
  });
});
