import React from 'react';
import { headerStyle } from '../style/HeaderStyle';
import { headerNBDefenseShieldIcon, headerBackground } from '../style/icons';

const NBDefenseHeader: React.FC = () => {
  return (
    <div className={headerStyle.wrapper}>
      <headerBackground.react
        className={headerStyle.backgroundImage}
        width="100%"
        height="65px"
      />
      <div className={headerStyle.contentWrapper}>
        <div className={headerStyle.iconWrapper}>
          <headerNBDefenseShieldIcon.react height="27px" />
        </div>
        <div className={headerStyle.grow}></div>
      </div>
    </div>
  );
};

export default NBDefenseHeader;
