import { Issue, IssueCode } from '../types';

export const getIssueCodeName = (issueCode: IssueCode): string => {
  switch (issueCode) {
    case IssueCode.PII_FOUND:
      return 'PII';
    case IssueCode.SECRETS:
      return 'Secret';
    case IssueCode.UNAPPROVED_LICENSE:
      return 'License';
    case IssueCode.VULNERABLE_DEPENDENCY:
      return 'CVE';
    default:
      return 'Unknown';
  }
};

export const getIssueVulnerability = (issueCode: IssueCode): string => {
  switch (issueCode) {
    case IssueCode.PII_FOUND:
      return 'Exposed personally identifiable information';
    case IssueCode.SECRETS:
      return 'Exposed secret';
    case IssueCode.UNAPPROVED_LICENSE:
      return 'Unapproved license associated with import';
    case IssueCode.VULNERABLE_DEPENDENCY:
      return 'CVE associated with import';
    default:
      return 'Unknown';
  }
};

export const getIssuesByCell = (
  issues?: Array<Issue>
): { [cellNumber: number]: Array<Issue> } => {
  if (issues) {
    const issuesByCell: { [cellNumber: number]: Array<Issue> } = {};
    for (const issue of issues) {
      if (issue.cell.cell_index in issuesByCell) {
        issuesByCell[issue.cell.cell_index].push(issue);
      } else {
        issuesByCell[issue.cell.cell_index] = [issue];
      }
    }
    return issuesByCell;
  } else {
    return {};
  }
};
