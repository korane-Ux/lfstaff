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
const controlErrorClass = "border-litige focus:border-litige focus:ring-litige/15";

type LabelProps = { label: ReactNode; hint?: ReactNode; error?: string };

function LabelRow({ label, hint }: Pick<LabelProps, "label" | "hint">) {
  return (
    <span className={labelRowClass}>
      <span className="font-medium text-encre/80">{label}</span>
      {hint && <span className="text-xs font-normal text-encre/45">{hint}</span>}
    </span>
  );
}

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-xs text-litige">
      {error}
    </p>
  );
}

export const TextField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & LabelProps
>(function TextField({ label, hint, error, className = "", ...props }, ref) {
  return (
    <label className={shellClass}>
      <LabelRow label={label} hint={hint} />
      <input
        ref={ref}
        aria-invalid={!!error}
        className={`${controlClass} ${error ? controlErrorClass : ""} ${className}`}
        {...props}
      />
      <ErrorText error={error} />
    </label>
  );
});

export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & LabelProps
>(function SelectField({ label, hint, error, className = "", children, ...props }, ref) {
  return (
    <label className={shellClass}>
      <LabelRow label={label} hint={hint} />
      <select
        ref={ref}
        aria-invalid={!!error}
        className={`${controlClass} ${error ? controlErrorClass : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ErrorText error={error} />
    </label>
  );
});

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & LabelProps
>(function TextareaField({ label, hint, error, className = "", ...props }, ref) {
  return (
    <label className={shellClass}>
      <LabelRow label={label} hint={hint} />
      <textarea
        ref={ref}
        aria-invalid={!!error}
        className={`${controlClass} ${error ? controlErrorClass : ""} ${className}`}
        {...props}
      />
      <ErrorText error={error} />
    </label>
  );
});
