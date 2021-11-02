import React from 'react';

import { IconChartBar } from './icon.chartBar';
import { IconChevronDown } from './icon.chevronDown';
import { IconCloudDownload } from './icon.cloudDownload';
import { IconDownload } from './icon.download';
import { IconExclamation } from './icon.exclamation';
import { IconHome } from './icon.home';
import { IconLogout } from './icon.logout';
import { IconMinusCircle } from './icon.minusCircle';
import { IconPlus } from './icon.plus';
import { IconPlusCircle } from './icon.plusCircle';
import { IconSwitchHorizontal } from './icon.switchHorizontal';
import { IconTag } from './icon.tag';
import { IconUpload } from './icon.upload';
import { IconUser } from './icon.user';
import { IconUserCircle } from './icon.userCircle';
import { IconViewGrid } from './icon.viewGrid';

export type IconName =
  | 'switch-horizontal'
  | 'plus-circle'
  | 'minus-circle'
  | 'home'
  | 'user'
  | 'chart-bar'
  | 'view-grid'
  | 'user-circle'
  | 'plus'
  | 'download'
  | 'upload'
  | 'logout'
  | 'tag'
  | 'exclamation'
  | 'cloud-download'
  | 'chevron-down';
interface IconProps {
  type: IconName;
  className?: string;
}

export const Icon = ({ type, className = '' }: IconProps): JSX.Element => {
  let defaultIconClasses = 'h-6 w-6';

  if (className) {
    defaultIconClasses = `${defaultIconClasses} ${className}`;
  }

  switch (type) {
    case 'switch-horizontal':
      return <IconSwitchHorizontal className={defaultIconClasses} />;

    case 'plus-circle':
      return <IconPlusCircle className={defaultIconClasses} />;

    case 'minus-circle':
      return <IconMinusCircle className={defaultIconClasses} />;

    case 'home':
      return <IconHome className={defaultIconClasses} />;

    case 'user':
      return <IconUser className={defaultIconClasses} />;

    case 'chart-bar':
      return <IconChartBar className={defaultIconClasses} />;

    case 'view-grid':
      return <IconViewGrid className={defaultIconClasses} />;

    case 'user-circle':
      return <IconUserCircle className={defaultIconClasses} />;

    case 'plus':
      return <IconPlus className={defaultIconClasses} />;

    case 'download':
      return <IconDownload className={defaultIconClasses} />;

    case 'upload':
      return <IconUpload className={defaultIconClasses} />;

    case 'logout':
      return <IconLogout className={defaultIconClasses} />;

    case 'tag':
      return <IconTag className={defaultIconClasses} />;

    case 'exclamation':
      return <IconExclamation className={defaultIconClasses} />;

    case 'cloud-download':
      return <IconCloudDownload className={defaultIconClasses} />;

    case 'chevron-down':
      return <IconChevronDown className={defaultIconClasses} />;

    default:
      break;
  }

  return <div />;
};
