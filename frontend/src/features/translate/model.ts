import { useCallback } from 'react'
import { backendApi } from '@/shared/api/backend'
import type { useTranslationEntity } from '@/entities/translation/model'

type Entity = ReturnType<typeof useTranslationEntity>

// useTranslate - feature hook. Orchestrates the translate action.
// Depends on the entity model via parameter injection (DIP).
export function useTranslate(entity: Entity) {
  return useCallback(async (text: string, fromLang: string, toLang: string) => {
    if (!text.trim()) return

    entity.setLoading()

    try {
      const result = await backendApi.translate({ text, fromLang, toLang })
      entity.setSuccess(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed'
      entity.setError(message)
    }
  }, [entity])
}
