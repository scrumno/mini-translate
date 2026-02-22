import type { CSSProperties, ReactNode, ChangeEvent, KeyboardEvent } from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    variant?: 'primary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    children: ReactNode
    style?: CSSProperties
    title?: string
}

export function Button({ onClick, disabled, loading, variant = 'primary', size = 'md', children, style, title }: ButtonProps) {
    const base: CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: size === 'sm' ? '4px 10px' : '8px 16px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontFamily: 'inherit',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        borderRadius: '8px',
        cursor: disabled || loading ? 'default' : 'pointer',
        opacity: disabled || loading ? 0.4 : 1,
        transition: 'background 0.1s ease, opacity 0.1s ease',
        whiteSpace: 'nowrap',
        outline: 'none',
        border: 'none',
        lineHeight: 1.4,
    }

    const variants: Record<string, CSSProperties> = {
        primary: {
            background: 'rgba(255,255,255,0.9)',
            color: '#111',
        },
        ghost: {
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)',
        },
        danger: {
            background: 'transparent',
            color: 'rgba(235,87,87,0.7)',
        },
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            title={title}
            style={{ ...base, ...variants[variant], ...style }}
            onMouseEnter={e => {
                if (disabled || loading) return
                if (variant === 'primary') e.currentTarget.style.background = 'rgba(255,255,255,0.75)'
                else if (variant === 'danger') e.currentTarget.style.background = 'rgba(235,87,87,0.08)'
                else e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={e => {
                if (variant === 'primary') e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
                else if (variant === 'danger') e.currentTarget.style.background = 'transparent'
                else e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
        >
            {loading ? <Spinner size={12} /> : children}
        </button>
    )
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectOption { value: string; label: string }

export function Select({ value, onChange, options, disabled }: {
    value: string; onChange: (v: string) => void; options: SelectOption[]; disabled?: boolean
}) {
    return (
        <select
            value={value}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
            style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px',
                fontFamily: 'inherit',
                fontWeight: 450,
                padding: '5px 8px',
                cursor: disabled ? 'default' : 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                minWidth: '80px',
                letterSpacing: '-0.01em',
            }}
        >
            {options.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#111113' }}>{o.label}</option>
            ))}
        </select>
    )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

export function Textarea({ value, onChange, onKeyDown, placeholder, disabled, rows = 4, autoFocus }: {
    value: string; onChange: (v: string) => void
    onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
    placeholder?: string; disabled?: boolean; rows?: number; autoFocus?: boolean
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
            spellCheck={false}
            style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 0,
                color: 'rgba(255,255,255,0.85)',
                fontSize: '14px',
                fontFamily: 'inherit',
                lineHeight: 1.75,
                padding: '10px 0',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: '-0.01em',
            }}
        />
    )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
             style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx="8" cy="8" r="6" stroke={color} strokeOpacity="0.15" strokeWidth="2" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider() {
    return <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
}

// ─── Empty ────────────────────────────────────────────────────────────────────

export function Empty({ message }: { message: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.18)', fontSize: '12px' }}>
            {message}
        </div>
    )
}

// ─── Chevron ──────────────────────────────────────────────────────────────────

export function Chevron({ open }: { open: boolean }) {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
             style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// ─── XIcon ────────────────────────────────────────────────────────────────────

export function XIcon({ size = 11 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}