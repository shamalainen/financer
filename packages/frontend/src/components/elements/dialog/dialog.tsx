import clsx from 'clsx';
import { useRef, useEffect } from 'react';

import { DialogCloseButton } from './dialog.close.button';

interface DialogProps {
  children: React.ReactNode;
  className?: string;
  isDialogOpen?: boolean;
  setIsDialogOpen: (state: boolean) => void;
  hasCloseButton?: boolean;
}

export const Dialog = ({
  children,
  isDialogOpen,
  setIsDialogOpen,
  className = '',
  hasCloseButton,
}: DialogProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref: any = useRef(null);

  useEffect(() => {
    const current = ref.current;

    const closeModal = () => {
      setIsDialogOpen(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clickOutside = (event: any) => {
      if (event.target === current) {
        current?.close();
      }
    };

    if (isDialogOpen) {
      current?.showModal?.();
    } else {
      current?.close?.();
    }

    current?.addEventListener('close', closeModal);
    current?.addEventListener('click', clickOutside);

    return () => {
      current?.removeEventListener('close', closeModal);
      current?.removeEventListener('close', clickOutside);
    };
  }, [isDialogOpen, setIsDialogOpen]);

  return (
    <dialog
      className={clsx(
        'z-20 rounded-md backdrop:bg-charcoal backdrop:opacity-30 w-full max-sm:mb-[calc(78px+env(safe-area-inset-bottom))] p-0 lg:max-w-screen-sm',
        {
          [className]: true,
        },
      )}
      ref={ref}
    >
      <section
        className={clsx({
          ['p-6']: true,
        })}
      >
        {hasCloseButton && (
          <section className="flex justify-end mb-4">
            <DialogCloseButton
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
            />
          </section>
        )}
        {children}
      </section>
    </dialog>
  );
};
