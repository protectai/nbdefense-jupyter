import React, { FC } from 'react';
import { kernelTrackerStyle } from '../style/KernelTrackerStyle';
import { exclamationIcon } from '../style/icons';
import { loadingIcon } from '../style/icons';

interface IKernelTrackerProps {
  kernelName: string | undefined;
  sitePackagesPath: string | undefined;
  loading: boolean;
}

const KernelTracker: FC<IKernelTrackerProps> = ({
  kernelName,
  sitePackagesPath,
  loading
}) => {
  return (
    <div className={kernelTrackerStyle.spacing}>
      <b>Kernel</b>
      <br />
      {loading || sitePackagesPath ? (
        <>{loading ? <loadingIcon.react /> : kernelName}</>
      ) : (
        <div className={kernelTrackerStyle.warningWrapper}>
          <exclamationIcon.react />
          <p className={kernelTrackerStyle.warning}>
            No Kernel Selected. Scans that rely on the kernel will be skipped.
          </p>
        </div>
      )}
    </div>
  );
};

export default KernelTracker;
