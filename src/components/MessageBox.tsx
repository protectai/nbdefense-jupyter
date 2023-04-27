import React from 'react';
import { messageBoxStyle } from '../style/MessageBoxStyle';
import { exclamationIcon, exclamationRedIcon } from '../style/icons';
import { MessageLevel } from '../types';

interface IMessageBoxProps {
  message: string;
  level?: MessageLevel;
}

/**
 * A generic message box that can display a warning or error.
 */
const MessageBox: React.FC<IMessageBoxProps> = ({
  message,
  level = MessageLevel.WARN
}) => {
  return (
    <div className={messageBoxStyle(level).wrapper}>
      {level === MessageLevel.WARN && <exclamationIcon.react />}
      {level === MessageLevel.ERROR && <exclamationRedIcon.react />}
      <p className={messageBoxStyle(level).message}>{message}</p>
    </div>
  );
};

export default MessageBox;
