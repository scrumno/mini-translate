import type { ReactNode } from 'react'
import { tokens } from '../tokens'

export function WindowButton({
  onClick,
  title,
  children,
  danger,
}: {
  onClick?: () => void
  title?: string
  children: ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        background: 'transparent',
        border: 'none',
        borderRadius: tokens.radius.sm,
        cursor: 'pointer',
        color: tokens.textMuted,
        transition: 'background 0.1s, color 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? tokens.dangerBg : tokens.bgHover
        e.currentTarget.style.color = danger ? tokens.danger : tokens.text
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = tokens.textMuted
      }}
    >
      {children}
    </button>
  )
}
