import { useId } from 'react';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  label: string;
  /** '' means "nothing selected" and shows the placeholder option. */
  value: T | '';
  options: readonly SelectOption<T>[];
  onChange: (value: T | '') => void;
  /** Text for an extra first option with value ''. Omit to have no empty option. */
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: SelectProps<T>) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <select
        id={id}
        className="field__control"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T | '')}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
