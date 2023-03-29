import { stylesheet } from 'typestyle';

export const nbdefensePanelStyle = stylesheet({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    padding: '1rem',
    backgroundColor: 'var(--jp-layout-color0)'
  },
  notebookIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '4px'
  },
  filepath: {
    whiteSpace: 'pre-wrap',
    marginBottom: '8px',
    fontWeight: '700',
    fontSize: '16px',
    lineHeight: '100%'
  }
});
