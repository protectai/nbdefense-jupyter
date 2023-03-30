import React from 'react';
import { noIssuesFoundIcon } from '../style/icons';
import { noIssuesFoundStylesheet } from '../style/NoIssuesFound';

const NoIssuesFound: React.FC = () => {
  return (
    <div className={noIssuesFoundStylesheet.wrapper}>
      <noIssuesFoundIcon.react />
      <h2 className={noIssuesFoundStylesheet.message}>No issues found</h2>
    </div>
  );
};

export default NoIssuesFound;
