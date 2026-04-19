'use client';

import { useState, useRef, useEffect, useId } from 'react';

export interface TebakAnswerInputProps {
  allCharacterNames: string[];
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

/** Normalize a string for comparison: lowercase + trim */
function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/** Simple fuzzy match: every char in query appears in order in target */
function fuzzyMatch(query: string, target: string): boolean {
  const q = normalize(query);
  const t = normalize(target);
  if (q.length === 0) return false;
  // Also accept simple substring match for better UX
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function TebakAnswerInput({
  allCharacterNames,
  onSubmit,
  disabled,
}: TebakAnswerInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const trimmed = value.trim();
  const suggestions =
    trimmed.length >= 2
      ? allCharacterNames.filter((name) => fuzzyMatch(trimmed, name)).slice(0, 8)
      : [];

  // Show suggestions only when input >= 2 chars and there are matches
  useEffect(() => {
    setShowSuggestions(trimmed.length >= 2 && suggestions.length > 0);
    setActiveIndex(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleSelect(name: string) {
    setValue(name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed || disabled) return;
    onSubmit(normalize(trimmed));
    setValue('');
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="off">
      <div className="relative">
        <label
          htmlFor="tebak-answer-input"
          className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ✏️ Tebakan Kamu
        </label>

        <input
          ref={inputRef}
          id="tebak-answer-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => {
            if (trimmed.length >= 2 && suggestions.length > 0) setShowSuggestions(true);
          }}
          disabled={disabled}
          placeholder="Ketik nama karakter..."
          className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '2px solid var(--color-border)',
            color: 'var(--color-text-bold)',
          }}
          aria-autocomplete="list"
          aria-controls={showSuggestions ? listId : undefined}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          aria-label="Masukkan nama karakter anime"
        />

        {/* Autocomplete dropdown */}
        {showSuggestions && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Saran nama karakter"
            className="absolute z-20 w-full mt-1 rounded-2xl overflow-hidden shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {suggestions.map((name, i) => (
              <li
                key={name}
                id={`${listId}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={() => handleSelect(name)}
                className="px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor:
                    i === activeIndex ? 'var(--color-surface-alt)' : 'transparent',
                  color:
                    i === activeIndex ? 'var(--color-primary)' : 'var(--color-text-bold)',
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !trimmed}
        className="w-full py-3 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor:
            disabled || !trimmed ? 'var(--color-border)' : 'var(--color-accent)',
          color: disabled || !trimmed ? 'var(--color-text-muted)' : '#fff',
        }}
      >
        🎯 Submit Jawaban
      </button>
    </form>
  );
}
