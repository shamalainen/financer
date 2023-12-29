import clsx from 'clsx';

interface RadioProps {
  children: string;
  className?: string;
  value: string;
  name: string;
  isChecked?: boolean;
}

export const Radio = ({
  children,
  className = '',
  name,
  value,
  isChecked,
}: RadioProps): JSX.Element => {
  return (
    <label
      className={clsx(
        'flex items-center p-4 gap-4 rounded-md hover:bg-gray focus-within:bg-gray hover:cursor-pointer',
        { [className]: true },
      )}
      htmlFor={`${name}-${value}`}
    >
      <input
        id={`${name}-${value}`}
        name={name}
        type="radio"
        value={value}
        className={clsx(
          'w-6 h-6 text-dreamless-sleep bg-gray border-gray-dark focus:ring-dreamless-sleep focus:ring-2 peer',
        )}
        defaultChecked={isChecked}
      />
      <span
        className={clsx(
          'text-base tracking-tight text-black peer-checked:font-medium',
        )}
      >
        {children}
      </span>
    </label>
  );
};
