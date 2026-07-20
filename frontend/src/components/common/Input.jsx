import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  required,
  ...props
}, ref) {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'input-field',
          error && 'input-error',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

export default Input;
