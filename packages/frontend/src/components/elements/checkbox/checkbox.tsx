import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

interface CheckboxProps {
  id: string;
  label: string;
  name: string;
  value: string;
}

export const Checkbox = ({
  id,
  label,
  name,
  value,
}: CheckboxProps): JSX.Element => {
  const { register } = useFormContext();

  return (
    <label
      className={clsx(
        'flex items-center p-4 gap-4 rounded-md hover:bg-gray focus-within:bg-gray hover:cursor-pointer',
      )}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        value={value}
        className={clsx(
          'rounded-sm w-6 h-6 text-dreamless-sleep bg-gray border-gray-dark focus:ring-dreamless-sleep focus:ring-2 peer',
        )}
        {...register(name)}
      />
      <span className="text-base tracking-tight text-black peer-checked:font-medium">
        {label}
      </span>
    </label>
  );
};
