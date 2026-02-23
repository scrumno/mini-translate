import { useState, useCallback, useEffect } from 'react'
import type { TranslationDTO, LanguageDTO, AsyncState } from '@/shared/types'
import { backendApi } from '@/shared/api/backend'
import { log } from '@/shared/lib/logger'

// ─── Translation State Model ──────────────────────────────────────────────────

export interface TranslationState {
  current: AsyncState<TranslationDTO>
  history: TranslationDTO[]
  languages: LanguageDTO[]
}

// Manages the translation entity state. Business-logic free — only data.

export function useTranslationEntity() {
  const [current, setCurrent] = useState<AsyncState<TranslationDTO>>({ status: 'idle' })
  const [history, setHistory] = useState<TranslationDTO[]>([])
  const [languages, setLanguages] = useState<LanguageDTO[]>([])

  const loadHistory = useCallback(async () => {
    log('[entity] loadHistory')
    try {
      const data = await backendApi.getHistory()
      setHistory(data ?? [])
      log('[entity] loadHistory done', data?.length ?? 0)
    } catch (e) {
      log('[entity] loadHistory error', e)
      setHistory([])
    }
  }, [])

  const loadLanguages = useCallback(async () => {
    log('[entity] loadLanguages')
    try {
      const data = await backendApi.getLanguages()
      setLanguages(data ?? [])
      log('[entity] loadLanguages done', data?.length ?? 0)
    } catch (e) {
      log('[entity] loadLanguages error', e)
      setLanguages([])
    }
  }, [])

  useEffect(() => {
    loadHistory()
    loadLanguages()
  }, [loadHistory, loadLanguages])

  const setLoading = () => {
    log('[entity] setLoading')
    setCurrent({ status: 'loading' })
  }
  const setSuccess = (data: TranslationDTO, addToHistory = true) => {
    log('[entity] setSuccess', data.id, addToHistory)
    setCurrent({ status: 'success', data })
    if (addToHistory) {
      setHistory(prev => [data, ...prev.slice(0, 99)])
    }
  }
  const setError = (error: string) => {
    log('[entity] setError', error)
    setCurrent({ status: 'error', error })
  }
  const clearError = () => {
    setCurrent(prev => (prev.status === 'error' ? { status: 'idle' } : prev))
  }
  const clearHistory = async () => {
    log('[entity] clearHistory')
    await backendApi.clearHistory()
    setHistory([])
  }

  return {
    current, history, languages,
    setLoading, setSuccess, setError, clearError,
    clearHistory, loadHistory,
  }
}
