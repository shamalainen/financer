import clsx from 'clsx';
import { useState } from 'react';

import { NavigationItem } from './navigation';
import { NavigationMobileActions } from './navigation.mobile.actions';
import { NavigationMobileItem } from './navigation.mobile.item';

interface NavigationMobileProps {
  navigationItems: Record<string, NavigationItem>;
}

export const NavigationMobile = ({
  navigationItems,
}: NavigationMobileProps) => {
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  return (
    <div
      className={clsx(
        'fixed bottom-0 left-0 right-0  w-full border-t bg-gray border-gray-dark pb-safe vt-name-[mobile-navigation]',
        { ['z-[101]']: isActionsModalOpen, ['z-[100]']: !isActionsModalOpen },
      )}
    >
      <nav>
        <ul className={`grid grid-cols-5 relative`}>
          <NavigationMobileItem {...navigationItems.home} />
          <NavigationMobileItem {...navigationItems.statistics} />
          <NavigationMobileActions
            isActionsModalOpen={isActionsModalOpen}
            setIsActionsModalOpen={setIsActionsModalOpen}
          />
          <NavigationMobileItem {...navigationItems.accounts} />
          <NavigationMobileItem {...navigationItems.settings} />
        </ul>
      </nav>
    </div>
  );
};
