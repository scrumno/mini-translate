import { useCallback, useEffect, useState } from 'react'
import { useTranslationEntity } from '@/entities/translation/model'
import type { TranslationDTO } from '@/shared/types'
import { useTranslate } from '@/features/translate/model'
import { useClipboardPaste } from '@/features/clipboard/model'
import { usePinWindow } from '@/features/pin-window/model'
import { useHotkeyPaste } from '@/features/hotkey/model'
import { TranslatorForm } from '@/widgets/translator-form/ui'
import { HistoryPanel } from '@/widgets/history-panel/ui'
import { SettingsModal } from '@/widgets/settings/ui'
import { Divider } from '@/shared/ui'
import { TranslatorProvider } from './context'
import { Titlebar } from './Titlebar'
import styles from './translator-page.module.css'

function TranslatorPageContent() {
  const { pinned, toggle: togglePin } = usePinWindow(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
      <Titlebar pinned={pinned} onTogglePin={togglePin} onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Divider />
      <div className={styles.content}>
        <TranslatorForm />
      </div>
      <HistoryPanel />
    </div>
  )
}

export function TranslatorPage() {
  const [inputText, setInputText] = useState('')
  const [fromLang, setFromLang] = useState('ru')
  const [toLang, setToLang] = useState('en')

  const entity = useTranslationEntity()
  const translate = useTranslate(entity)

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
      <TranslatorPageContent />
    </TranslatorProvider>
  )
}
