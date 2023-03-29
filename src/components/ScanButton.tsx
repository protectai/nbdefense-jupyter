import React from 'react';
import { loadingIcon } from '../style/icons';
import { loadingIconStyle, scanButtonStyle } from '../style/ScanButtonStyle';

interface IScanButtonProps {
  isLoading: boolean;
  scanExists: boolean;
  onClick: () => Promise<void>;
}

const ScanButton: React.FC<IScanButtonProps> = ({
  isLoading,
  scanExists,
  onClick
}) => {
  return (
    <button disabled={isLoading} onClick={onClick} className={scanButtonStyle}>
      {isLoading ? (
        <>
          <loadingIcon.react className={loadingIconStyle} /> Scanning...
        </>
      ) : scanExists ? (
        'Rescan'
      ) : (
        'Scan'
      )}
    </button>
  );
};

export default ScanButton;
