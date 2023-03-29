import { stylesheet } from 'typestyle';

export const dirtyScanStyle = stylesheet({
  wrapper: {
    display: 'flex',
    marginTop: '16px',
    padding: '10px',
    border: '1px #F4BD4F',
    borderStyle: 'solid',
    borderRadius: '6px',
    backgroundColor: '#FFEFCF'
  },
  warning: {
    alignItems: 'center',
    padding: '0px',
    paddingLeft: '10px'
  }
});
