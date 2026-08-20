import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const shellClass = "flex flex-col gap-1.5 text-sm text-encre";
const labelRowClass = "flex items-baseline justify-between gap-2";
export const controlClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none transition-colors focus:border-braise focus:ring-2 focus:ring-braise/15";

type LabelProps = { label: ReactNode; hint?: ReactNode };

function LabelRow({ label, hint }: LabelProps) {
  return (
    <span className={labelRowClass}>
      <span className="font-medium text-encre/80">{label}</span>
      {hint && <span className="text-xs font-normal text-encre/45">{hint}</span>}
    </span>
  );
}

export const TextField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & LabelProps
>(function TextField({ label, hint, className = "", ...props }, ref) {
  return (
    <label className={shellClass}>
      <LabelRow label={label} hint={hint} />
      <input ref={ref} className={`${controlClass} ${className}`} {...props} />
    </label>
  );
});

export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & LabelProps
>(function SelectField({ label, hint, className = "", children, ...props }, ref) {
  return (
    <label className={shellClass}>
      <LabelRow label={label} hint={hint} />
      <select ref={ref} className={`${controlClass} ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
});

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & LabelProps
>(function TextareaField({ label, hint, className = "", ...props }, ref) {
  return (
    <label className={shellClass}>
      <LabelRow label={label} hint={hint} />
      <textarea ref={ref} className={`${controlClass} ${className}`} {...props} />
    </label>
  );
});
