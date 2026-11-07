import { useId, type InputHTMLAttributes } from 'react';

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'id'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Visually hide the label (it stays available to screen readers and tests). */
  hideLabel?: boolean;
}

export function TextInput({ label, value, onChange, hideLabel, type = 'text', ...rest }: TextInputProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'field__label'}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="field__control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
    </div>
  );
}
