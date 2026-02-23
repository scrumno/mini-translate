import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import {
  Select,
  Textarea,
  WindowButton,
  Button,
  IconArrowLeftRight,
  IconClipboard,
} from '@/shared/ui'
import { backendApi } from '@/shared/api/backend'
import { useTranslatorContext } from '@/pages/translator/context'
import { ResultBox } from './ResultBox'
import styles from './translator-form.module.css'

export function TranslatorForm() {
  const ctx = useTranslatorContext()
  const { inputText, setInputText, fromLang, setFromLang, toLang, setToLang, languages, translationState, onTranslate, onPasteClipboard, onSwapLanguages } = ctx
  const isLoading = translationState.status === 'loading'
  const langOptions = languages.map(l => ({ value: l.code, label: l.name }))
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savingAnki, setSavingAnki] = useState(false)
  const [savingObsidian, setSavingObsidian] = useState(false)

  const onTranslateRef = useRef(onTranslate)
  onTranslateRef.current = onTranslate
  const pasteTimerRef = useRef<number>()

  useEffect(() => {
    setSaveError(null)
  }, [inputText])

  useEffect(() => {
    return () => {
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current)
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onTranslate()
    }
  }

  const handleTextPaste = () => {
    if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current)
    pasteTimerRef.current = window.setTimeout(() => {
      onTranslateRef.current()
    }, 500)
  }

  const getSavePayload = () => {
    if (translationState.status !== 'success') return null
    const { source, result } = translationState.data
    return {
      source,
      result,
      fromLang,
      toLang,
      isPhrase: source.trim().includes(' '),
    }
  }

  const handleSaveToAnki = async () => {
    const payload = getSavePayload()
    if (!payload) return
    setSaveError(null)
    setSavingAnki(true)
    try {
      const res = await backendApi.saveToAnki(payload)
      if (res.error) setSaveError(res.error)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setSavingAnki(false)
    }
  }

  const handleSaveToObsidian = async () => {
    const payload = getSavePayload()
    if (!payload) return
    setSaveError(null)
    setSavingObsidian(true)
    try {
      const res = await backendApi.saveToObsidian(payload)
      if (res.error) setSaveError(res.error)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setSavingObsidian(false)
    }
  }

  const showSaveRow = translationState.status === 'success'

  return (
    <div className={styles.root}>
      <div className={styles.langRow}>
        <Select value={fromLang} onChange={setFromLang} options={langOptions} disabled={isLoading} />
        <WindowButton onClick={onSwapLanguages} title="Поменять языки местами">
          <IconArrowLeftRight size={18} />
        </WindowButton>
        <Select
          value={toLang}
          onChange={setToLang}
          options={langOptions.filter(o => o.value !== 'auto')}
          disabled={isLoading}
        />
        <WindowButton onClick={onPasteClipboard} title="Вставить из буфера">
          <IconClipboard size={18} />
        </WindowButton>
      </div>
      <Textarea
        value={inputText}
        onChange={setInputText}
        onKeyDown={handleKeyDown}
        onPaste={handleTextPaste}
        placeholder="Введите текст для перевода…"
        disabled={isLoading}
        rows={4}
        autoFocus
      />
      <ResultBox state={translationState} />
      {showSaveRow && (
        <div className={styles.saveRow}>
          <Button onClick={handleSaveToAnki} disabled={savingAnki} loading={savingAnki} size="sm" variant="ghost">
            В Anki
          </Button>
          <Button onClick={handleSaveToObsidian} disabled={savingObsidian} loading={savingObsidian} size="sm" variant="ghost">
            В Obsidian
          </Button>
          {saveError && <span className={styles.saveError}>{saveError}</span>}
        </div>
      )}
    </div>
  )
}
