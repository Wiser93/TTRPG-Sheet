import { useState, useRef } from 'react';
import { FormField } from './FormField';

interface TagInputProps {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({ label, hint, values, onChange, suggestions = [], placeholder = 'Type and press Enter…' }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = input.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s))
    : [];

  function add(value: string) {
    const trimmed = value.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function remove(value: string) {
    onChange(values.filter(v => v !== value));
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) add(input);
    } else if (e.key === 'Backspace' && input === '' && values.length > 0) {
      remove(values[values.length - 1]);
    }
  }

  return (
    <FormField label={label} hint={hint}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          padding: '6px 8px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          cursor: 'text',
          minHeight: 38,
          position: 'relative',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {values.map(v => (
          <span key={v} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '1px 8px',
            fontSize: 12,
            color: 'var(--text-0)',
          }}>
            {v}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); remove(v); }}
              style={{ fontSize: 14, lineHeight: 1, color: 'var(--text-2)', padding: 0 }}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={values.length === 0 ? placeholder : ''}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            color: 'var(--text-0)',
            minWidth: 80,
            flex: 1,
            padding: '1px 0',
            width: 'auto',
          }}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filtered.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            zIndex: 50,
            maxHeight: 180,
            overflowY: 'auto',
            marginTop: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}>
            {filtered.map(s => (
              <button
                key={s}
                type="button"
                onMouseDown={() => add(s)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  fontSize: 13,
                  color: 'var(--text-0)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}

// ── Multi-checkbox variant for fixed option sets ──────────────

interface CheckboxGroupProps {
  label: string;
  hint?: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: number;
}

export function CheckboxGroup({ label, hint, options, values, onChange, columns = 2 }: CheckboxGroupProps) {
  function toggle(opt: string) {
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);
  }
  return (
    <FormField label={label} hint={hint}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 4 }}>
        {options.map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input
              type="checkbox"
              checked={values.includes(opt)}
              onChange={() => toggle(opt)}
              style={{ width: 14, height: 14, accentColor: 'var(--accent)' }}
            />
            {opt}
          </label>
        ))}
      </div>
    </FormField>
  );
}
