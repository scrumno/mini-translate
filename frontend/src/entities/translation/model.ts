import { useState, useCallback, useEffect } from 'react'
import type { TranslationDTO, LanguageDTO, AsyncState } from '@/shared/types'
import { backendApi } from '@/shared/api/backend'

// ─── Translation State Model ──────────────────────────────────────────────────

export interface TranslationState {
  current: AsyncState<TranslationDTO>
  history: TranslationDTO[]
  languages: LanguageDTO[]
}

// ─── useTranslation hook ──────────────────────────────────────────────────────
// Manages the translation entity state. Business-logic free — only data.

export function useTranslationEntity() {
  const [current, setCurrent] = useState<AsyncState<TranslationDTO>>({ status: 'idle' })
  const [history, setHistory] = useState<TranslationDTO[]>([])
  const [languages, setLanguages] = useState<LanguageDTO[]>([])

  const loadHistory = useCallback(async () => {
    try {
      const data = await backendApi.getHistory()
      setHistory(data ?? [])
    } catch {
      setHistory([])
    }
  }, [])

  const loadLanguages = useCallback(async () => {
    try {
      const data = await backendApi.getLanguages()
      setLanguages(data ?? [])
    } catch {
      setLanguages([])
    }
  }, [])

  useEffect(() => {
    loadHistory()
    loadLanguages()
  }, [loadHistory, loadLanguages])

  const setLoading = () => setCurrent({ status: 'loading' })
  const setSuccess = (data: TranslationDTO, addToHistory = true) => {
    setCurrent({ status: 'success', data })
    if (addToHistory) {
      setHistory(prev => [data, ...prev.slice(0, 99)])
    }
  }
  const setError = (error: string) => setCurrent({ status: 'error', error })
  const clearHistory = async () => {
    await backendApi.clearHistory()
    setHistory([])
  }

  return {
    current, history, languages,
    setLoading, setSuccess, setError,
    clearHistory, loadHistory,
  }
}
