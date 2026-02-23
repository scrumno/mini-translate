import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import type { ConfigDTO } from '@/shared/types'
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
  const [autoAnkiMsg, setAutoAnkiMsg] = useState<string | null>(null)
  const [config, setConfig] = useState<ConfigDTO | null>(null)
  const lastAutoSavedId = useRef<string | null>(null)

  useEffect(() => {
    backendApi.getConfig().then(setConfig).catch(() => {})
  }, [])

  const onTranslateRef = useRef(onTranslate)
  onTranslateRef.current = onTranslate
  const pasteTimerRef = useRef<number>()

  useEffect(() => {
    setSaveError(null)
    setAutoAnkiMsg(null)
  }, [inputText])

  useEffect(() => {
    if (
      translationState.status !== 'success' ||
      !config?.autoAddToAnki ||
      lastAutoSavedId.current === translationState.data.id
    ) return
    lastAutoSavedId.current = translationState.data.id
    const { source, result } = translationState.data
    backendApi
      .saveToAnki({ source, result, fromLang, toLang, isPhrase: source.trim().includes(' ') })
      .then(res => {
        setAutoAnkiMsg(res.error ? res.error : 'Добавлено в Anki')
      })
      .catch(() => setAutoAnkiMsg('Ошибка автодобавления'))
  }, [translationState, config, fromLang, toLang])

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
          {!config?.autoAddToAnki && (
            <Button onClick={handleSaveToAnki} disabled={savingAnki} loading={savingAnki} size="sm" variant="ghost">
              В Anki
            </Button>
          )}
          {autoAnkiMsg && <span className={styles.saveHint}>{autoAnkiMsg}</span>}
          {saveError && <span className={styles.saveError}>{saveError}</span>}
        </div>
      )}
    </div>
  )
}
