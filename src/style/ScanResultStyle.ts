import { stylesheet } from 'typestyle';
import { Severity } from '../types';

const severityColors = {
  [Severity.LOW]: '#07B7CE',
  [Severity.MEDIUM]: '#F4BD4F',
  [Severity.HIGH]: '#ED6A5E',
  [Severity.CRITICAL]: '#D01100'
};

export const scanResultStyle = stylesheet({
  listItem: {
    listStyle: 'none',
    margin: '5px 0',
    paddingInlineStart: 0
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 0',
    width: '100%',
    borderBottom: '1px solid var(--jp-layout-color2)'
  },
  title: {
    fontWeight: 700,
    fontSize: '14px',
    marginLeft: '8px',
    textTransform: 'capitalize'
  },
  caret: {
    display: 'flex',
    height: '12px',
    width: '12px',
    transition: 'rotate .25s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  expandedCaret: {
    rotate: '90deg'
  },
  issueCount: {
    borderRadius: '4px',
    color: 'white',
    height: '16px',
    width: '16px',
    textAlign: 'center',
    margin: '0 4px 0 auto'
  },
  [`issueCount${Severity.LOW}`]: {
    backgroundColor: severityColors[Severity.LOW]
  },
  [`issueCount${Severity.MEDIUM}`]: {
    backgroundColor: severityColors[Severity.MEDIUM]
  },
  [`issueCount${Severity.HIGH}`]: {
    backgroundColor: severityColors[Severity.HIGH]
  },
  [`issueCount${Severity.CRITICAL}`]: {
    backgroundColor: severityColors[Severity.CRITICAL]
  },
  innerList: {
    listStyle: 'none',
    padding: '12px',
    backgroundColor: 'var(--jp-layout-color2)'
  },
  issueListItem: {
    margin: '8px 0',
    $nest: {
      '&:not(:last-child)': {
        paddingBottom: '8px',
        borderBottom: '1px solid #E0E0E0'
      },
      '&:last-child': {
        marginBottom: 0
      },
      '&:first-child': {
        marginTop: 0
      }
    }
  },
  issueListItemWrapper: {
    display: 'block',
    paddingLeft: '8px',
    borderLeft: '4px solid',
    fontSize: '12px'
  },
  [`issueListItemWrapper${Severity.LOW}`]: {
    borderLeftColor: severityColors[Severity.LOW]
  },
  [`issueListItemWrapper${Severity.MEDIUM}`]: {
    borderLeftColor: severityColors[Severity.MEDIUM]
  },
  [`issueListItemWrapper${Severity.HIGH}`]: {
    borderLeftColor: severityColors[Severity.HIGH]
  },
  [`issueListItemWrapper${Severity.CRITICAL}`]: {
    borderLeftColor: severityColors[Severity.CRITICAL]
  },
  issueType: {
    fontWeight: 'bold',
    fontSize: '14px'
  }
});
