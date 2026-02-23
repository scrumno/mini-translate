import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react'
import { tokens } from '../tokens'

export function Textarea({
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  disabled,
  rows = 4,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  autoFocus?: boolean
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      disabled={disabled}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      spellCheck={false}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${tokens.borderSubtle}`,
        borderRadius: 0,
        color: tokens.text,
        fontSize: tokens.fontSize.lg,
        fontFamily: tokens.font,
        lineHeight: 1.75,
        padding: '8px 0',
        resize: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        letterSpacing: '-0.01em',
        caretColor: tokens.text,
      }}
    />
  )
}
