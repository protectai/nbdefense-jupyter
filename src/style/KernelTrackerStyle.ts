import { stylesheet } from 'typestyle';

export const kernelTrackerStyle = stylesheet({
  warningWrapper: {
    display: 'flex',
    padding: '10px',
    border: '1px #F4BD4F',
    borderStyle: 'solid',
    borderRadius: '6px',
    backgroundColor: '#FFEFCF'
  },
  spacing: {
    paddingBottom: '8px'
  },
  warning: {
    alignItems: 'center',
    padding: '0px',
    paddingLeft: '10px'
  }
});
