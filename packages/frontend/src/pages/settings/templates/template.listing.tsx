import { useMemo } from 'react';

import { TransactionTemplateDto } from '$api/generated/financerApi';
import { settingsPaths } from '$constants/settings-paths';
import { ButtonInternal } from '$elements/button/button.internal';
import { Icon, IconName } from '$elements/icon/icon';
import { LinkList } from '$elements/link-list/link-list';
import { LinkListLink } from '$elements/link-list/link-list.link';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

interface TemplateListingProps {
  templates: TransactionTemplateDto[];
}

export const TemplateListing = ({
  templates,
}: TemplateListingProps): JSX.Element => {
  const filteredTemplates = useMemo(
    () => [
      {
        label: 'Manual',
        items: templates.filter(
          ({ templateType }) => templateType[0] === 'manual',
        ),
      },
      {
        label: 'Automatic',
        items: templates.filter(
          ({ templateType }) => templateType[0] === 'auto',
        ),
      },
    ],
    [templates],
  );

  return (
    <>
      <UpdatePageInfo
        title="Templates"
        backLink={settingsPaths.default}
        headerAction={
          <ButtonInternal
            link={`${settingsPaths.templates}/add`}
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
          >
            <span className="sr-only">Add template</span>
            <Icon type={IconName.plus} />
          </ButtonInternal>
        }
      />
      <section className="grid gap-8">
        {filteredTemplates.map(({ label, items }) => (
          <LinkList label={label} key={label}>
            {items.map(({ templateName, id }) => (
              <LinkListLink
                icon={IconName.lightningBolt}
                key={id}
                link={`${settingsPaths.templates}/${id}/edit`}
              >
                {templateName}
              </LinkListLink>
            ))}
          </LinkList>
        ))}
      </section>
    </>
  );
};
