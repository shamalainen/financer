import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useCallback } from 'react';

import {
  ViewTransition,
  useViewTransitionRouter,
} from '$hooks/useViewTransitionRouter';

type AnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps
>;

interface LinkViewTransitionProps extends AnchorProps, NextLinkProps {
  children: React.ReactNode;
  transition?: ViewTransition;
}

export const LinkViewTransition: React.FC<LinkViewTransitionProps> = ({
  transition,
  ...props
}) => {
  const router = useViewTransitionRouter(transition);

  const handleLinkClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      router.push(props.href.toString());
    },
    [props.href, router],
  );

  return <NextLink {...props} onClick={handleLinkClick} />;
};
