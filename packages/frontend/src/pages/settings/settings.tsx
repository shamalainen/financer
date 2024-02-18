import { useMemo } from 'react';

import { Role } from '$api/generated/financerApi';
import { settingsPaths } from '$constants/settings-paths';
import { Button } from '$elements/button/button';
import { IconName } from '$elements/icon/icon';
import { LinkList } from '$elements/link-list/link-list';
import { LinkListLink } from '$elements/link-list/link-list.link';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

interface SettingsProps {
  roles?: Role[];
}

export const Settings = ({ roles }: SettingsProps): JSX.Element => {
  const urls = useMemo(
    () => [
      {
        label: 'Account',
        items: [
          {
            children: 'User preferences',
            link: settingsPaths.userPreferences,
            icon: IconName.userCircle,
          },
          {
            children: 'Download my data',
            link: settingsPaths.dataDownload,
            icon: IconName.cloudDownload,
          },
        ],
      },
      {
        label: 'Financer',
        items: [
          {
            children: 'Templates',
            link: settingsPaths.templates,
            icon: IconName.lightningBolt,
          },
          {
            children: 'Categories',
            link: settingsPaths.categories,
            icon: IconName.tag,
          },
          ...(roles?.includes(Role.TestUser)
            ? [
                {
                  children: 'Overrite data',
                  link: settingsPaths.dataOverride,
                  icon: IconName.exclamation,
                },
              ]
            : []),
        ],
      },
    ],
    [roles],
  );

  return (
    <>
      <UpdatePageInfo title="Settings" />
      <section className="grid gap-8">
        {urls.map(({ label, items }) => (
          <LinkList key={label} label={label}>
            {items.map((item) => (
              <LinkListLink key={item.link} {...item} />
            ))}
          </LinkList>
        ))}
      </section>
      <Button
        accentColor="plain"
        link="/auth/logout"
        className="mt-12 lg:hidden"
      >
        Sign out
      </Button>
    </>
  );
};
