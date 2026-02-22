import { useState, useCallback } from 'react'
import { useTranslationEntity } from '@/entities/translation/model'
import type { TranslationDTO } from '@/shared/types'
import { useTranslate } from '@/features/translate/model'
import { useClipboardPaste } from '@/features/clipboard/model'
import { usePinWindow } from '@/features/pin-window/model'
import { useHotkeyPaste } from '@/features/hotkey/model'
import { TranslatorForm } from '@/widgets/translator-form/ui'
import { HistoryPanel } from '@/widgets/history-panel/ui'
import { Divider } from '@/shared/ui'

function PinIcon({ active }: { active: boolean }) {
    return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
                d="M7.5 1.5L11.5 5.5L8.5 8.5V11.5L4.5 7.5H1.5L4.5 4.5L7.5 1.5Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={active ? 'rgba(255,255,255,0.15)' : 'none'}
            />
        </svg>
    )
}

function Titlebar({ pinned, onTogglePin }: { pinned: boolean; onTogglePin: () => void }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 10px',
            // @ts-expect-error wails
            '--wails-draggable': 'drag',
            userSelect: 'none',
            WebkitUserSelect: 'none',
        }}>
      <span style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
      }}>
        Translate
      </span>

            <button
                onClick={onTogglePin}
                title={pinned ? 'Unpin' : 'Pin on top'}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '26px',
                    height: '26px',
                    background: pinned ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    color: pinned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.15s ease',
                    // @ts-expect-error wails
                    '--wails-draggable': 'no-drag',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = pinned ? 'rgba(255,255,255,0.08)' : 'transparent'
                    e.currentTarget.style.color = pinned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'
                }}
            >
                <PinIcon active={pinned} />
            </button>
        </div>
    )
}

export function TranslatorPage() {
    const [inputText, setInputText] = useState('')
    const [fromLang, setFromLang] = useState('auto')
    const [toLang, setToLang] = useState('ru')

    const entity = useTranslationEntity()
    const translate = useTranslate(entity)
    const { pinned, toggle: togglePin } = usePinWindow(true)

    const handleTranslate = useCallback(() => {
        translate(inputText, fromLang, toLang)
    }, [translate, inputText, fromLang, toLang])

    const handlePaste = useCallback((text: string) => {
        setInputText(text)
        translate(text, fromLang, toLang)
    }, [translate, fromLang, toLang])

    const pasteFromClipboard = useClipboardPaste(handlePaste)
    useHotkeyPaste(handlePaste)

    const handleHistorySelect = useCallback((item: TranslationDTO) => {
        setInputText(item.source)
        setFromLang(item.fromLang)
        setToLang(item.toLang)
        entity.setSuccess(item, false) // false = don't add to history again
    }, [entity])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#111113',
            color: '#f5f5f5',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif",
            overflow: 'hidden',
        }}>
            <Titlebar pinned={pinned} onTogglePin={togglePin} />

            <Divider />

            {/* Main content */}
            <div style={{ padding: '16px 20px', flex: 1, overflow: 'hidden' }}>
                <TranslatorForm
                    inputText={inputText}
                    fromLang={fromLang}
                    toLang={toLang}
                    languages={entity.languages}
                    translationState={entity.current}
                    onInputChange={setInputText}
                    onFromLangChange={setFromLang}
                    onToLangChange={setToLang}
                    onTranslate={handleTranslate}
                    onPasteClipboard={pasteFromClipboard}
                />
            </div>

            {/* Collapsible history at bottom */}
            <HistoryPanel
                items={entity.history}
                onSelect={handleHistorySelect}
                onClear={entity.clearHistory}
            />
        </div>
    )
}