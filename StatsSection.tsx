/* ============================================================
   DESIGN TOKENS
   ============================================================ */
:root {
  /* Colours */
  --bg-0:      #0e0e14;   /* deepest background */
  --bg-1:      #1a1a2e;   /* card backgrounds */
  --bg-2:      #252540;   /* elevated surfaces */
  --bg-3:      #2f2f50;   /* hover states */
  --border:    #3a3a60;
  --text-0:    #f0f0ff;   /* primary text */
  --text-1:    #b0b0cc;   /* secondary text */
  --text-2:    #7070a0;   /* muted text */
  --accent:    #7b68ee;   /* medium slate blue */
  --accent-2:  #e06c75;   /* red — damage, danger */
  --accent-3:  #61afef;   /* blue — info, spells */
  --accent-4:  #98c379;   /* green — healing, ok */
  --accent-5:  #e5c07b;   /* gold — XP, currency */

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  /* Typography */
  --font-body:    'Georgia', 'Times New Roman', serif;
  --font-ui:      system-ui, -apple-system, sans-serif;
  --font-mono:    'Courier New', monospace;
  --text-xs:  11px;
  --text-sm:  13px;
  --text-md:  15px;
  --text-lg:  18px;
  --text-xl:  22px;
  --text-2xl: 28px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Transitions */
  --transition: 150ms ease;
}

/* ============================================================
   RESET
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: var(--text-md);
  color-scheme: dark;
  -webkit-tap-highlight-color: transparent;
}

body {
  background: var(--bg-0);
  color: var(--text-0);
  font-family: var(--font-ui);
  line-height: 1.5;
  min-height: 100dvh;
  overflow-x: hidden;
}

/* Safe area insets for notched phones */
.app {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  min-height: 100dvh;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
}

input, select, textarea {
  background: var(--bg-2);
  color: var(--text-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font: inherit;
  width: 100%;
  outline: none;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}

/* ============================================================
   UTILITY CLASSES
   ============================================================ */
.card {
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  transition: background var(--transition), opacity var(--transition);
}

.btn-primary {
  background: var(--accent);
  color: white;
}
.btn-primary:hover { opacity: 0.85; }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-1);
}
.btn-ghost:hover { background: var(--bg-3); }

.btn-danger {
  background: var(--accent-2);
  color: white;
}

.label {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-2);
}

.divider {
  height: 1px;
  background: var(--border);
  margin: var(--space-4) 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}
