import { stylesheet } from 'typestyle';

export const errorMessageStyle = stylesheet({
  wrapper: {
    display: 'flex',
    marginTop: '16px',
    padding: '10px',
    border: '1px #d01100',
    borderStyle: 'solid',
    borderRadius: '6px',
    backgroundColor: 'rgb(208 17 0 / 10%)'
  }
});
