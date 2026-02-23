import type { CSSProperties, ReactNode } from 'react'
import { tokens } from '../tokens'
import { Spinner } from '../spinner/Spinner'

export interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'ghost' | 'danger' | 'window'
  size?: 'sm' | 'md'
  children: ReactNode
  style?: CSSProperties
  title?: string
  active?: boolean
}

export function Button({
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  children,
  style,
  title,
  active,
}: ButtonProps) {
  const isWindow = variant === 'window'

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: isWindow ? '4px' : size === 'sm' ? '5px 12px' : '7px 14px',
    width: isWindow ? '28px' : undefined,
    height: isWindow ? '28px' : undefined,
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.font,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    borderRadius: tokens.radius.sm,
    cursor: disabled || loading ? 'default' : 'pointer',
    opacity: disabled || loading ? 0.35 : 1,
    transition: 'background 0.1s, outline 0.1s',
    whiteSpace: 'nowrap',
    outline: active ? `1.5px solid ${tokens.border}` : '1.5px solid transparent',
    outlineOffset: '1px',
    border: 'none',
    lineHeight: 1,
    background: 'transparent',
    color: variant === 'primary' ? tokens.buttonText : variant === 'danger' ? tokens.danger : tokens.textMuted,
    ...(variant === 'primary' && { background: tokens.buttonBg }),
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      style={{ ...base, ...style }}
      onMouseEnter={e => {
        if (disabled || loading) return
        e.currentTarget.style.outline = `1.5px solid ${tokens.border}`
        if (variant === 'primary') e.currentTarget.style.background = 'rgba(229,229,229,0.9)'
        else if (variant === 'danger') e.currentTarget.style.background = tokens.dangerBg
        else e.currentTarget.style.background = tokens.bgHover
      }}
      onMouseLeave={e => {
        e.currentTarget.style.outline = active ? `1.5px solid ${tokens.border}` : '1.5px solid transparent'
        if (variant === 'primary') e.currentTarget.style.background = tokens.buttonBg
        else if (variant === 'danger') e.currentTarget.style.background = 'transparent'
        else e.currentTarget.style.background = 'transparent'
      }}
    >
      {loading ? <Spinner size={16} /> : children}
    </button>
  )
}
