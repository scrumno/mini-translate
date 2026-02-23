import { useCallback, useEffect, useState } from 'react'
import { useTranslationEntity } from '@/entities/translation/model'
import type { TranslationDTO, ConfigDTO } from '@/shared/types'
import { useTranslate } from '@/features/translate/model'
import { useClipboardPaste } from '@/features/clipboard/model'
import { usePinWindow } from '@/features/pin-window/model'
import { useHotkeyPaste } from '@/features/hotkey/model'
import { backendApi } from '@/shared/api/backend'
import { TranslatorForm } from '@/widgets/translator-form/ui'
import { HistoryPanel } from '@/widgets/history-panel/ui'
import { SettingsModal } from '@/widgets/settings/ui'
import { CompactMode } from '@/widgets/compact-mode/ui'
import { Divider } from '@/shared/ui'
import { TranslatorProvider } from './context'
import { Titlebar } from './Titlebar'
import styles from './translator-page.module.css'

function useAnkiHotkeyToast() {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const runtime = window.runtime
    if (!runtime) return
    runtime.EventsOn('anki:added', (data: unknown) => {
      const resp = data as { error?: string; noteId?: number; word?: string }
      if (resp?.error) {
        setToast(resp.error)
      } else {
        setToast(resp?.word ? `${resp.word} — добавлено` : 'Добавлено в Anki')
      }
      setTimeout(() => setToast(null), 3000)
    })
    return () => { runtime.EventsOff('anki:added') }
  }, [])

  return toast
}

function FullModeContent({ compact, onToggleCompact, ankiHotkey }: { compact: boolean; onToggleCompact: () => void; ankiHotkey: string }) {
  const { pinned, toggle: togglePin } = usePinWindow(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const ankiToast = useAnkiHotkeyToast()

  return (
    <div className={styles.root}>
      <div className={`${styles.resizeZone} ${styles.resizeTop}`} />
      <div className={`${styles.resizeZone} ${styles.resizeRight}`} />
      <div className={`${styles.resizeZone} ${styles.resizeBottom}`} />
      <div className={`${styles.resizeZone} ${styles.resizeLeft}`} />
      <div className={`${styles.resizeCorner} ${styles.resizeTopLeft}`} />
      <div className={`${styles.resizeCorner} ${styles.resizeTopRight}`} />
      <div className={`${styles.resizeCorner} ${styles.resizeBottomRight}`} />
      <div className={`${styles.resizeCorner} ${styles.resizeBottomLeft}`} />
      <Titlebar pinned={pinned} onTogglePin={togglePin} onOpenSettings={() => setSettingsOpen(true)} onToggleCompact={onToggleCompact} compact={compact} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Divider />
      {compact ? (
        <CompactMode ankiHotkey={ankiHotkey} toast={ankiToast} />
      ) : (
        <>
          {ankiToast && <div className={styles.toast}>{ankiToast}</div>}
          <div className={styles.content}>
            <TranslatorForm />
          </div>
          <HistoryPanel />
        </>
      )}
    </div>
  )
}

export function TranslatorPage() {
  const [inputText, setInputText] = useState('')
  const [fromLang, setFromLang] = useState('ru')
  const [toLang, setToLang] = useState('en')
  const [compact, setCompact] = useState(false)
  const [ankiHotkey, setAnkiHotkey] = useState('')

  const entity = useTranslationEntity()
  const translate = useTranslate(entity)

  useEffect(() => {
    backendApi.getConfig().then((cfg: ConfigDTO) => {
      if (cfg.compactMode) {
        setCompact(true)
        window.runtime?.WindowSetSize?.(250, 80)
      }
      setAnkiHotkey(cfg.hotkeyAddToAnki || '')
    }).catch(() => {})
  }, [])

  useEffect(() => {
    entity.clearError()
  }, [inputText])

  const handleTranslate = useCallback(() => {
    translate(inputText, fromLang, toLang)
  }, [translate, inputText, fromLang, toLang])

  const handlePaste = useCallback(
    (text: string) => {
      setInputText(text)
      translate(text, fromLang, toLang)
    },
    [translate, fromLang, toLang]
  )

  const pasteFromClipboard = useClipboardPaste(handlePaste)
  useHotkeyPaste(handlePaste)

  const handleHistorySelect = useCallback(
    (item: TranslationDTO) => {
      setInputText(item.source)
      setFromLang(item.fromLang)
      setToLang(item.toLang)
      entity.setSuccess(item, false)
    },
    [entity]
  )

  const handleSwapLanguages = useCallback(() => {
    const newFrom = toLang
    const newTo = fromLang === 'auto' ? toLang : fromLang
    setFromLang(newFrom)
    setToLang(newTo)
  }, [fromLang, toLang])

  const handleToggleCompact = useCallback(() => {
    setCompact(prev => {
      const next = !prev
      if (next) {
        window.runtime?.WindowSetSize?.(250, 80)
      } else {
        window.runtime?.WindowSetSize?.(380, 520)
      }
      return next
    })
  }, [])

  const contextValue = {
    inputText,
    setInputText,
    fromLang,
    setFromLang,
    toLang,
    setToLang,
    languages: entity.languages,
    translationState: entity.current,
    onTranslate: handleTranslate,
    onPasteClipboard: pasteFromClipboard,
    onSwapLanguages: handleSwapLanguages,
    history: entity.history,
    onHistorySelect: handleHistorySelect,
    onClearHistory: entity.clearHistory,
  }

  return (
    <TranslatorProvider value={contextValue}>
      <FullModeContent compact={compact} onToggleCompact={handleToggleCompact} ankiHotkey={ankiHotkey} />
    </TranslatorProvider>
  )
}
