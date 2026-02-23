import { useCallback } from 'react'
import { backendApi } from '@/shared/api/backend'
import { log } from '@/shared/lib/logger'
import type { useTranslationEntity } from '@/entities/translation/model'

type Entity = ReturnType<typeof useTranslationEntity>

// useTranslate - feature hook. Orchestrates the translation action.
// Depends on the entity model via parameter injection (DIP).
export function useTranslate(entity: Entity) {
  return useCallback(async (text: string, fromLang: string, toLang: string) => {
    log('[translate] called', { text: text.slice(0, 30), fromLang, toLang })
    if (!text.trim()) return

    entity.setLoading()

    try {
      const result = await backendApi.translate({ text, fromLang, toLang })
      entity.setSuccess(result)
      log('[translate] success', result.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось перевести текст'
      entity.setError(message)
      log('[translate] error', message, err)
    }
  }, [entity])
}
