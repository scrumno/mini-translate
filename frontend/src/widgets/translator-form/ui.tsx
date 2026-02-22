import type { KeyboardEvent, CSSProperties } from 'react'
import type { LanguageDTO, AsyncState, TranslationDTO } from '@/shared/types'
import { Button, Select, Textarea, Spinner } from '@/shared/ui'

interface TranslatorFormProps {
    inputText: string
    fromLang: string
    toLang: string
    languages: LanguageDTO[]
    translationState: AsyncState<TranslationDTO>
    onInputChange: (text: string) => void
    onFromLangChange: (lang: string) => void
    onToLangChange: (lang: string) => void
    onTranslate: () => void
    onPasteClipboard: () => void
}

function ResultBox({ state }: { state: AsyncState<TranslationDTO> }) {
    if (state.status === 'idle') return null

    if (state.status === 'loading') {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 0',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '13px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
                <Spinner size={13} color="rgba(255,255,255,0.25)" />
                Translating…
            </div>
        )
    }

    if (state.status === 'error') {
        return (
            <div style={{
                padding: '10px 0',
                borderTop: '1px solid rgba(235,87,87,0.15)',
                color: 'rgba(235,87,87,0.7)',
                fontSize: '12px',
                lineHeight: 1.5,
            }}>
                {state.error}
            </div>
        )
    }

    // Render result preserving newlines
    const lines = state.data.result.split('\n')

    return (
        <div style={{
            padding: '12px 0 4px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            animation: 'fadeUp 0.18s ease',
        }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
            <div style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                marginBottom: '8px',
            }}>
                Result
            </div>
            <div style={{
                fontSize: '14px',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.88)',
                userSelect: 'text',
                cursor: 'text',
                letterSpacing: '-0.01em',
                whiteSpace: 'pre-wrap',
            } as CSSProperties}>
                {lines.map((line, i) => (
                    <div key={i} style={{ minHeight: line === '' ? '1.75em' : undefined }}>
                        {line || '\u00A0'}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function TranslatorForm({
                                   inputText, fromLang, toLang, languages, translationState,
                                   onInputChange, onFromLangChange, onToLangChange, onTranslate, onPasteClipboard,
                               }: TranslatorFormProps) {
    const isLoading = translationState.status === 'loading'
    const langOptions = languages.map(l => ({ value: l.code, label: l.name }))

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onTranslate()
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Lang row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Select value={fromLang} onChange={onFromLangChange} options={langOptions} disabled={isLoading} />
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', userSelect: 'none' }}>→</span>
                    <Select
                        value={toLang}
                        onChange={onToLangChange}
                        options={langOptions.filter(o => o.value !== 'auto')}
                        disabled={isLoading}
                    />
                </div>
                <Button variant="ghost" size="sm" onClick={onPasteClipboard} disabled={isLoading}>
                    Paste
                </Button>
            </div>

            {/* Input */}
            <Textarea
                value={inputText}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type text to translate…"
                disabled={isLoading}
                rows={4}
                autoFocus
            />

            {/* Hint + button row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px',
            }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '-0.01em' }}>
          ↵ translate · ⇧↵ new line
        </span>
                <Button onClick={onTranslate} loading={isLoading} disabled={!inputText.trim()}>
                    Translate
                </Button>
            </div>

            {/* Result */}
            <div style={{ marginTop: '10px' }}>
                <ResultBox state={translationState} />
            </div>
        </div>
    )
}