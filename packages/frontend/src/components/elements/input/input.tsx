import clsx from 'clsx';
import React, { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

interface InputProps {
  children: React.ReactNode;
  help?: string;
  id: string;
  isRequired?: boolean;
  type?: 'text' | 'number' | 'datetime-local';
  value?: string | number;
  min?: number;
  max?: number;
  step?: number;
  ref?: React.MutableRefObject<null>;
  onChange?(event: ChangeEvent<HTMLInputElement>): void;
  testId?: string;
}

const getValueParsingOptions = (type: InputProps['type']) => {
  if (type === 'number') return { valueAsNumber: true };
  if (type === 'datetime-local') return { valueAsDate: true };

  return {};
};

export const Input = ({
  children,
  help = '',
  id,
  isRequired = false,
  type = 'text',
  min,
  max,
  step,
  testId,
}: InputProps): JSX.Element => {
  const { register } = useFormContext();

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs tracking-tight text-black/75 uppercase font-medium"
      >
        {children}
      </label>
      <div className="mt-1 rounded-md">
        <input
          id={id}
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          min={min}
          max={max}
          step={step}
          className={clsx(
            'appearance-none block w-full px-3 py-3 border border-transparent text-black bg-gray rounded-md focus:ring-black focus:border-black tracking-normal',
          )}
          aria-describedby={help && `${id}-description`}
          required={isRequired}
          data-testid={testId}
          {...register(id, {
            min,
            max,
            required: isRequired,
            ...getValueParsingOptions(type),
          })}
        />
      </div>
      {help && (
        <p className="mt-2 text-sm text-charcoal" id={`${id}-description`}>
          {help}
        </p>
      )}
    </div>
  );
};
