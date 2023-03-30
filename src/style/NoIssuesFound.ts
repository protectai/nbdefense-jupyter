import { stylesheet } from 'typestyle';

export const noIssuesFoundStylesheet = stylesheet({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '78px'
  },
  message: {
    marginTop: '8px',
    fontWeight: 700,
    fontSize: '16px'
  }
});
