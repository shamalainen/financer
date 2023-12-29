import clsx from 'clsx';
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { DrawerHeader } from './drawer.header';

import { useOnClickOutside } from '$hooks/useOnClickOutside';
import { useWindowDimensions } from '$hooks/useWindowDimensions';
import { setHeaderActionState } from '$reducer/app.reducer';

interface DrawerProps {
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  testId?: string;
  id?: string;
  noBackdrop?: boolean;
  allowedRefs?: MutableRefObject<null>[] | MutableRefObject<null>;
  heading?: string;
  description?: string;
}

export const Drawer = ({
  className = '',
  isOpen = false,
  onClose,
  children,
  testId,
  id,
  noBackdrop,
  allowedRefs = [],
  heading,
  description,
}: DrawerProps) => {
  const [isOpenDelayed, setIsOpenDelayed] = useState(false);
  const [isClosedDelay, setIsClosedDelay] = useState(true);

  const dispatch = useDispatch();

  const drawerRef = useRef(null);
  const targetRefsArray = useMemo(() => {
    const allowedRefsArray = Array.isArray(allowedRefs)
      ? allowedRefs
      : [allowedRefs];

    return [drawerRef, ...allowedRefsArray];
  }, [allowedRefs]);

  useOnClickOutside(targetRefsArray, () => {
    onClose();
  });

  useEffect(() => {
    const updateHeaderActionState = () => {
      dispatch(setHeaderActionState(isOpen));
    };

    if (isOpen) {
      updateHeaderActionState();
    }

    const timeout = setTimeout(() => setIsOpenDelayed(isOpen), 50);
    const closedTimeout = setTimeout(
      () => {
        setIsClosedDelay(!isOpen);
        updateHeaderActionState();
      },
      isOpen ? 0 : 200,
    );

    return () => {
      clearTimeout(timeout);
      clearTimeout(closedTimeout);
    };
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscapePress = (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('keydown', handleEscapePress as any);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.removeEventListener('keydown', handleEscapePress as any);
    };
  }, [isOpen, onClose]);

  const drawerClasses = {
    left: clsx('', {
      ['top-0 bottom-0 overflow-y-auto']: true,
      ['max-w-[600px] w-[75%]']: true,
      ['max-[1440px]:right-0 min-[1440px]:max-w-[552px] min-[1440px]:box-content']:
        true,
      ['min-[1440px]:pr-[100vw] min-[1440px]:mr-[-100vw] min-[1440px]:right-[calc(calc(100vw-1440px)/2+1.5rem)]']:
        true,
      ['max-[1440px]:aria-hidden:-right-[100vw] min-[1440px]:aria-hidden:-right-[calc(100vw)]']:
        true,
    }),
    bottom: clsx('', {
      ['bottom-0 left-0 right-0']: true,
      ['rounded-t-2xl box-content']: true,
      ['aria-hidden:-bottom-[100vh]']: true,
    }),
  };

  const { width } = useWindowDimensions();

  const defaultDrawerClasses =
    width >= 1024 ? drawerClasses.left : drawerClasses.bottom;

  const drawerBaseClasses = clsx('', {
    [className]: true,
    ['bg-white fixed transition-all z-[200] duration-200 text-left']: true,
    ['px-8 pt-8 pb-[calc(env(safe-area-inset-bottom)+48px)]']: true,
    [defaultDrawerClasses]: true,
    ['hidden']: isClosedDelay,
  });

  if (!isOpen && !isOpenDelayed) return null;

  return (
    <>
      <section
        className={drawerBaseClasses}
        aria-hidden={!isOpen || !isOpenDelayed}
        ref={drawerRef}
        id={id}
        data-testid={testId ?? 'drawer'}
      >
        <DrawerHeader onClose={onClose} heading={heading} className="mb-8">
          {description}
        </DrawerHeader>
        {isClosedDelay ? null : children}
      </section>
      {!noBackdrop && (
        <div
          data-testid="drawer-backdrop"
          aria-hidden="true"
          className={clsx(
            'fixed inset-0 bg-black/[.50] transition-opacity duration-200',
            {
              ['z-[102] opacity-100']: isOpen,
              ['-z-10 opacity-0']: !isOpen || !isOpenDelayed,
            },
          )}
        />
      )}
    </>
  );
};
