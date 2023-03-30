import { differenceInMinutes, format } from 'date-fns';
import { ScanResultsState } from '../hooks/useScanResults';

export const getFormattedLastUpdatedTime = (
  currentTime: Date,
  results: ScanResultsState,
  notebookPath?: string
): string => {
  if (notebookPath && notebookPath in results) {
    const lastUpdated = results[notebookPath].lastUpdated;
    if (lastUpdated) {
      return differenceInMinutes(currentTime, lastUpdated) < 1
        ? 'Just now'
        : getTimestampLastUpdatedTime(results, notebookPath);
    }
  }
  return 'Never scanned';
};

export const getTimestampLastUpdatedTime = (
  results: ScanResultsState,
  notebookPath?: string
): string => {
  if (notebookPath && notebookPath in results) {
    const lastUpdated = results[notebookPath].lastUpdated;
    if (lastUpdated) {
      return format(lastUpdated, 'MM/dd/yy hh:mm:ss aa');
    }
  }
  return '';
};
