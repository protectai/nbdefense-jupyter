import { style } from 'typestyle';

const baseButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '16px',
  border: 'none',
  borderRadius: '6px',
  padding: '10px',
  backgroundColor: '#0060A8',
  color: 'white',
  cursor: 'pointer',
  lineHeight: '16px',
  fontSize: '14px'
};

export const scanButtonStyle = style({
  ...baseButtonStyle,
  $nest: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'wait'
    }
  }
});

export const disabledButtonStyle = style({
  ...baseButtonStyle,
  opacity: 0.5,
  cursor: 'default'
});

export const loadingIconStyle = style({
  height: '16px',
  width: '16px',
  marginRight: '8px'
});
