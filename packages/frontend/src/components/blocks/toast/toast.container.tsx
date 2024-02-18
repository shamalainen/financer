import clsx from 'clsx';
import { memo } from 'react';

import { Toast } from './toast';

import { useAppSelector } from '$store/*';

interface ToastContainerProps {
  className?: string;
}

export const ToastContainer = memo(
  ({ className = '' }: ToastContainerProps): JSX.Element | null => {
    const { toastMessages } = useAppSelector((state) => state.notification);

    if (!toastMessages.length) return null;

    return (
      <div className={clsx('', { [className]: true })} data-testid="toast">
        <ul className="space-y-4">
          {toastMessages.map((toast) => (
            <li key={toast.id}>
              <Toast {...toast} />
            </li>
          ))}
        </ul>
      </div>
    );
  },
);

ToastContainer.displayName = 'ToastContainer';
