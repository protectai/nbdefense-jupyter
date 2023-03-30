import React from 'react';
import { classes } from 'typestyle';
import AnimateHeight from 'react-animate-height';
import { scanResultStyle } from '../style/ScanResultStyle';
import { Issue, ScannedNotebook, Severity } from '../types';
import { caretIcon } from '../style/icons';
import { getIssueCodeName } from '../utils/issueUtils';

interface IScanResultProps {
  scannedNotebook: ScannedNotebook;
  severity: Severity;
  issues: Array<Issue> | undefined;
}

const ScanResult: React.FC<IScanResultProps> = ({
  scannedNotebook,
  severity,
  issues
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  return (
    <li className={scanResultStyle.listItem}>
      <a
        onClick={event => {
          event.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        className={scanResultStyle.link}
      >
        <b className={scanResultStyle.title}>{severity.toLowerCase()}</b>
        <span
          className={classes(
            scanResultStyle.issueCount,
            scanResultStyle[`issueCount${severity}`]
          )}
        >
          {issues?.length || 0}
        </span>
        <caretIcon.react
          className={classes(
            scanResultStyle.caret,
            isExpanded && scanResultStyle.expandedCaret
          )}
        />
      </a>
      <AnimateHeight duration={500} height={isExpanded ? 'auto' : 0}>
        <ul className={scanResultStyle.innerList}>
          {issues?.map(issue => (
            <li
              key={issue.cell.cell_index + issue.code + issue.location}
              className={scanResultStyle.issueListItem}
            >
              <a
                className={classes(
                  scanResultStyle.issueListItemWrapper,
                  scanResultStyle[`issueListItemWrapper${severity}`]
                )}
                onClick={event => {
                  event.preventDefault();
                  const relevantCell =
                    scannedNotebook.notebook?.widgets[issue.cell.cell_index];
                  if (relevantCell) {
                    scannedNotebook.notebook?.scrollToCell(relevantCell);
                  }
                }}
              >
                <p className={scanResultStyle.issueType}>
                  Issue type: {getIssueCodeName(issue.code)}
                </p>
                <p>{issue.details?.description}</p>
                <p>Cell index: {issue.cell.cell_index}</p>
              </a>
            </li>
          ))}
          {issues?.length === 0 && (
            <>No issues were found at this severity level</>
          )}
        </ul>
      </AnimateHeight>
    </li>
  );
};

export default ScanResult;
