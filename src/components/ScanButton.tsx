import React from 'react';
import { loadingIcon } from '../style/icons';
import {
  disabledButtonStyle,
  loadingIconStyle,
  scanButtonStyle
} from '../style/ScanButtonStyle';

interface IScanButtonProps {
  disabled: boolean;
  isLoading: boolean;
  scanExists: boolean;
  onClick: () => Promise<void>;
}

const ScanButton: React.FC<IScanButtonProps> = ({
  isLoading,
  scanExists,
  onClick,
  disabled
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      onClick={onClick}
      className={disabled ? disabledButtonStyle : scanButtonStyle}
    >
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
