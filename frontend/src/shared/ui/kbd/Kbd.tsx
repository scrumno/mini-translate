import type { ReactNode } from 'react'
import { tokens } from '../tokens'

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 5px',
        background: tokens.bgHover,
        border: `1px solid ${tokens.borderSubtle}`,
        borderRadius: '4px',
        fontSize: '10px',
        color: tokens.textMuted,
        fontFamily: 'monospace',
        lineHeight: 1.6,
        letterSpacing: 0,
      }}
    >
      {children}
    </span>
  )
}
