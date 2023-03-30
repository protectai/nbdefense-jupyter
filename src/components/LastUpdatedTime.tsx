import React from 'react';
import { ScanResultsState } from '../hooks/useScanResults';
import {
  getFormattedLastUpdatedTime,
  getTimestampLastUpdatedTime
} from '../utils/timeUtils';

interface ILastUpdatedTimeProps {
  results: ScanResultsState;
  notebookPath?: string;
}

const LastUpdatedTime: React.FC<ILastUpdatedTimeProps> = ({
  results,
  notebookPath
}) => {
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const refreshTimeInterval = setInterval(
      () => setCurrentTime(new Date()),
      1000
    );

    return () => clearInterval(refreshTimeInterval);
  }, []);

  return (
    <p title={getTimestampLastUpdatedTime(results, notebookPath)}>
      <b>Last scan</b>
      <br />
      {getFormattedLastUpdatedTime(currentTime, results, notebookPath)}
    </p>
  );
};

export default LastUpdatedTime;
