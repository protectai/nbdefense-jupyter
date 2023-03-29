import React from 'react';
import { classes } from 'typestyle';
import {
  cellErrorDropdownStyle,
  getWrapperStyles
} from '../style/CellErrorDropdownStyle';
import { alertCircleIcon } from '../style/icons';
import { Issue } from '../types';
import { getIssueCodeName, getIssueVulnerability } from '../utils/issueUtils';

interface ICellErrorDropdownProps {
  notebookIssues: Array<Issue>;
}

const CellErrorDropdown: React.FC<ICellErrorDropdownProps> = ({
  notebookIssues
}) => {
  return (
    <div
      className={classes(
        getWrapperStyles(notebookIssues[0].cell.cell_index),
        'nbdefense-cell-error-dropdown'
      )}
    >
      <div className={cellErrorDropdownStyle.innerWrapper}>
        {notebookIssues.map(issue => (
          <div
            key={issue.details?.description}
            className={cellErrorDropdownStyle.issueWrapper}
          >
            <alertCircleIcon.react
              className={cellErrorDropdownStyle.alertIcon}
            />
            <div>
              <h3 className={cellErrorDropdownStyle.header}>
                {getIssueCodeName(issue.code)}
              </h3>
              <p>Vulnerability: {getIssueVulnerability(issue.code)}</p>
              <p>
                Description: {issue.details?.description}
                {issue.details?.summary_field ? (
                  <>
                    {' '}
                    in cell {issue.location} with tags:
                    <pre>
                      {JSON.stringify(
                        issue.details.summary_field,
                        undefined,
                        '  ' // two spaces
                      )}
                    </pre>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CellErrorDropdown;
