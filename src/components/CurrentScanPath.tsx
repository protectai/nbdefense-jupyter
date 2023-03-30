import React from 'react';
import { PageConfig } from '@jupyterlab/coreutils';
import { fullScanPathStyle } from '../style/FullScanPathStyle';
import Path from 'path-browserify';

interface ILastUpdatedTimeProps {
  notebookPath?: string;
}

const CurrentScanPath: React.FC<ILastUpdatedTimeProps> = ({ notebookPath }) => {
  return (
    <p className={fullScanPathStyle.spacing}>
      <b>Full Path</b>
      <br />
      {notebookPath
        ? `${Path.join(
            PageConfig.getOption('serverRoot'),
            Path.dirname(notebookPath)
          )}/`
        : 'Please select a notebook'}
    </p>
  );
};

export default CurrentScanPath;
