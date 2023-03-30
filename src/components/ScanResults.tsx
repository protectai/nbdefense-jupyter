import React from 'react';
import { scanResultsStylesheet } from '../style/ScanResultsStyle';
import { Issue, Report, ScannedNotebook, Severity } from '../types';
import NoIssuesFound from './NoIssuesFound';
import ScanResult from './ScanResult';

interface IScanResultsProps {
  scannedNotebook: ScannedNotebook;
  results: Report | undefined;
  scanHasErrors: boolean;
}

const ScanResults: React.FC<IScanResultsProps> = ({
  scannedNotebook,
  results,
  scanHasErrors
}) => {
  return (
    <>
      {scanFoundNoIssues(results) ? (
        scanHasErrors ? null : (
          <NoIssuesFound />
        )
      ) : (
        <>
          <h2 className={scanResultsStylesheet.header}>Found issues:</h2>
          <ul className={scanResultsStylesheet.list}>
            {Object.entries(getIssuesBySeverity(results)).map(
              ([severity, issues]) => {
                return (
                  <ScanResult
                    scannedNotebook={scannedNotebook}
                    issues={issues}
                    severity={severity as Severity} // Gets cast as a string during Object.entries conversion
                    key={`${severity}-${scannedNotebook.notebookPath}`}
                  />
                );
              }
            )}
          </ul>
        </>
      )}
    </>
  );
};

const getIssuesBySeverity = (
  results: Report | undefined
): { [severity in Severity]?: Array<Issue> } => {
  if (results && typeof results === 'object' && 'notebook_issues' in results) {
    const issuesBySeverity: { [severity in Severity]?: Array<Issue> } = {
      [Severity.CRITICAL]: [],
      [Severity.HIGH]: [],
      [Severity.MEDIUM]: [],
      [Severity.LOW]: []
    };
    results.notebook_issues[0].issues.forEach(issue => {
      issuesBySeverity[issue.severity]?.push(issue);
    });
    return issuesBySeverity;
  }
  return {};
};

const scanFoundNoIssues = (results?: Report): boolean => {
  return (
    results !== undefined &&
    results.notebook_issues &&
    results.notebook_issues[0].issues.length === 0
  );
};

export default ScanResults;
