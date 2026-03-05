import { type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, hint, required, children }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
        {label}{required && <span style={{ color: 'var(--accent-2)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{hint}</p>}
    </div>
  );
}

// ── Convenience wrappers ──────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}
export function LabeledInput({ label, hint, ...props }: InputProps) {
  return (
    <FormField label={label} hint={hint} required={props.required}>
      <input {...props} />
    </FormField>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
}
export function LabeledSelect({ label, hint, options, ...props }: SelectProps) {
  return (
    <FormField label={label} hint={hint}>
      <select {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FormField>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}
export function LabeledTextarea({ label, hint, ...props }: TextareaProps) {
  return (
    <FormField label={label} hint={hint}>
      <textarea rows={3} style={{ resize: 'vertical' }} {...props} />
    </FormField>
  );
}

// ── Row layout helper ─────────────────────────────────────────

export function FormRow({ children, cols = 2 }: { children: ReactNode; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {children}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          {title}
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      {children}
    </div>
  );
}
