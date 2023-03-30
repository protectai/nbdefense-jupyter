import React from 'react';
import { ScanError, ReportError } from '../types';
import { errorMessageStyle } from '../style/ErrorMessageStyle';

interface IErrorMessageProps {
  errors?: Array<ScanError | ReportError>;
}

const ErrorMessage: React.FC<IErrorMessageProps> = ({ errors }) => {
  return (
    <>
      {errors &&
        errors.map((error: ScanError | ReportError, index: number) => {
          const errorMessage =
            'plugin_name' in error
              ? `An error occurred in the ${error.plugin_name} when scanning: ${error.message}`
              : error.message;
          return (
            <div
              key={`${index}-${errorMessage}`}
              className={errorMessageStyle.wrapper}
              dangerouslySetInnerHTML={{
                __html: `${errorMessage}`
              }}
            ></div>
          );
        })}
    </>
  );
};

export default ErrorMessage;
