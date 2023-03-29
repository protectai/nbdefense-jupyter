import React from 'react';
import { dirtyScanStyle } from '../style/DirtyScanStyle';
import { exclamationIcon } from '../style/icons';

const DirtyStateWarning: React.FC = () => {
  return (
    <div className={dirtyScanStyle.wrapper}>
      <exclamationIcon.react />
      <p className={dirtyScanStyle.warning}>
        The notebook contents have changed since the last run. The results may
        be outdated.
      </p>
    </div>
  );
};

export default DirtyStateWarning;
