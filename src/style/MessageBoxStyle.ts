import { stylesheet } from 'typestyle';
import { MessageLevel } from '../types';

interface IMessageBoxStyleRet {
  wrapper: string;
  message: string;
}

export const messageBoxStyle = (level: MessageLevel): IMessageBoxStyleRet =>
  stylesheet({
    wrapper: {
      display: 'flex',
      marginTop: '16px',
      padding: '10px',
      borderStyle: 'solid',
      borderRadius: '6px',
      border: level === MessageLevel.WARN ? '1px #F4BD4F' : '1px #D01100',
      backgroundColor: level === MessageLevel.WARN ? '#FFEFCF' : '#FFCCCB'
    },
    message: {
      alignItems: 'center',
      padding: '0px',
      paddingLeft: '10px'
    }
  });
