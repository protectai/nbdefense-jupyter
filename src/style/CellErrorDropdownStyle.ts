import { stylesheet, style } from 'typestyle';

export const cellErrorDropdownStyle = stylesheet({
  innerWrapper: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  issueWrapper: {
    display: 'flex',
    $nest: {
      '&:not(:first-child)': {
        borderTop: '1px solid #E0E0E0',
        paddingTop: '8px',
        marginTop: '8px'
      }
    }
  },
  alertIcon: {
    margin: '0 12px 0 0'
  },
  header: {
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '20px',
    margin: 0
  }
});

export const getWrapperStyles = (cellIndex: number): string => {
  return style({
    backgroundColor: 'var(--jp-layout-color1)',
    color: 'var(--jp-ui-font-color0)',
    zIndex: 999 - cellIndex,
    overflowY: 'hidden',
    overflowX: 'auto',
    position: 'absolute',
    top: '100%',
    left: 'calc(var(--jp-cell-collapser-width) + var(--jp-cell-prompt-width))',
    width: '460px',
    maxWidth:
      'calc(100% - (var(--jp-cell-collapser-width) + var(--jp-cell-prompt-width)))',
    maxHeight: 0,
    transition: 'max-height .5s ease',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
  });
};
