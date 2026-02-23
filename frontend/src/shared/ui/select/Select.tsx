import type { ChangeEvent } from 'react'
import { tokens } from '../tokens'

export function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      style={{
        flex: 1,
        background: 'transparent',
        border: `1px solid ${tokens.borderSubtle}`,
        borderRadius: tokens.radius.sm,
        color: tokens.text,
        fontSize: tokens.fontSize.sm,
        fontFamily: tokens.font,
        fontWeight: 500,
        padding: '6px 8px',
        cursor: disabled ? 'default' : 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        textAlign: 'center',
        letterSpacing: '-0.01em',
        transition: 'border-color 0.1s',
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = tokens.border
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = tokens.borderSubtle
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: tokens.bg, textAlign: 'center' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
