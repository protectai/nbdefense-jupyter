import { stylesheet } from 'typestyle';

export const headerStyle = stylesheet({
  wrapper: {
    position: 'sticky',
    top: 0
  },
  backgroundImage: {
    height: '65px',
    background: '#091228',
    position: 'absolute',
    width: '100%',
    zIndex: '-1'
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: '65px',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  grow: {
    flexGrow: '1'
  },
  iconWrapper: {
    height: '27px'
  }
});
