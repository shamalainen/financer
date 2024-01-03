import clsx from 'clsx';
import { useRouter as useNextRouter } from 'next/router';
import { useRef, useMemo, useEffect } from 'react';

import { transitionHelper } from '$utils/transitionHelper';

export type ViewTransition = false | 'open-from-right' | 'close-to-right';

export const useViewTransitionRouter = (transition?: ViewTransition) => {
  // ): ReturnType<typeof useNextRouter> => {
  const router = useNextRouter();
  // const pathname = usePathname();
  const pathname = router.pathname;

  const promiseCallbacks = useRef<Record<
    'resolve' | 'reject',
    (value: unknown) => void
  > | null>(null);

  useEffect(() => {
    return () => {
      if (promiseCallbacks.current) {
        promiseCallbacks.current.resolve(undefined);
        promiseCallbacks.current = null;
      }
    };
  }, [pathname]);

  return useMemo(() => {
    const skipTransition = typeof transition === 'boolean' ? transition : false;
    const classNames = clsx({
      'open-from-right': transition === 'open-from-right',
      'close-to-right': transition === 'close-to-right',
    });

    return {
      ...router,
      back: () => {
        transitionHelper({
          updateDOM: () => router.back(),
          skipTransition,
          classNames,
        });
      },
      forward: () => {
        transitionHelper({
          updateDOM: () => router.forward(),
          skipTransition,
          classNames,
        });
      },
      push: (...args: Parameters<typeof router.push>) => {
        transitionHelper({
          updateDOM: () => {
            const url = args[0] as string;
            if (url === pathname) {
              router.push(...args);
            } else {
              return new Promise((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                promiseCallbacks.current = { resolve, reject };
                router.push(...args);
              });
            }
          },
          skipTransition,
          classNames,
        });
      },
      // replace: (...args: Parameters<typeof router.replace>) => {
      //   transitionHelper({
      //     updateDOM: () => router.replace(...args),
      //     skipTransition,
      //     classNames,
      //   });
      // },
    };
  }, [pathname, router, transition]);
};
