import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClass =
  "rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-soft/70 focus:border-accent focus:ring-1 focus:ring-accent";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  name,
  error,
  hint,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input id={name} name={name} className={inputClass} {...props} />
      {hint && !error && <span className="text-xs text-ink-soft">{hint}</span>}
      {error && <span className="text-xs text-loss">{error}</span>}
    </label>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <select id={name} name={name} className={inputClass} {...props}>
        {children}
      </select>
      {hint && !error && <span className="text-xs text-ink-soft">{hint}</span>}
      {error && <span className="text-xs text-loss">{error}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  hint,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <textarea id={name} name={name} rows={3} className={inputClass} {...props} />
      {hint && !error && <span className="text-xs text-ink-soft">{hint}</span>}
      {error && <span className="text-xs text-loss">{error}</span>}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md border border-loss/40 bg-loss/10 px-3 py-2 text-sm text-loss">
      {message}
    </p>
  );
}
