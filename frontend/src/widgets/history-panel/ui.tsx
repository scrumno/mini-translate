import { useState } from 'react'
import type { TranslationDTO } from '@/shared/types'
import { Empty, Chevron, XIcon } from '@/shared/ui'

interface HistoryPanelProps {
    items: TranslationDTO[]
    onSelect: (item: TranslationDTO) => void
    onClear: () => void
}

function HistoryItem({ item, onSelect }: { item: TranslationDTO; onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                width: '100%',
                textAlign: 'left',
                padding: '8px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
                transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
      <span style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.72)',
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: '-0.01em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
          maxWidth: '100%',
      }}>
        {item.source}
      </span>
            <span style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.28)',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                maxWidth: '100%',
                letterSpacing: '-0.01em',
            }}>
        {item.result}
      </span>
        </button>
    )
}

export function HistoryPanel({ items, onSelect, onClear }: HistoryPanelProps) {
    const [open, setOpen] = useState(false)

    return (
        <div style={{ flexShrink: 0 }}>
            {/* Toggle header */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'inherit',
                    transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            History
          </span>
                    {items.length > 0 && (
                        <span style={{
                            fontSize: '10px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 500,
                        }}>
              {items.length}
            </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {open && items.length > 0 && (
                        <button
                            onClick={e => { e.stopPropagation(); onClear() }}
                            title="Clear history"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '5px',
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: '11px',
                                padding: '2px 7px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.12s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'rgba(235,87,87,0.8)'
                                e.currentTarget.style.borderColor = 'rgba(235,87,87,0.3)'
                                e.currentTarget.style.background = 'rgba(235,87,87,0.06)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            <XIcon size={9} />
                            Clear
                        </button>
                    )}
                    <Chevron open={open} />
                </div>
            </button>

            {/* Collapsible list */}
            {open && (
                <div style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    animation: 'slideDown 0.18s ease',
                }}>
                    <style>{`
            @keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
            ::-webkit-scrollbar{width:3px}
            ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
          `}</style>
                    {items.length === 0
                        ? <Empty message="No history yet" />
                        : items.map(item => (
                            <HistoryItem key={item.id} item={item} onSelect={() => onSelect(item)} />
                        ))
                    }
                </div>
            )}
        </div>
    )
}