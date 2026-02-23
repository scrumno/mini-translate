import { useCallback } from 'react'
import { backendApi } from '@/shared/api/backend'

// Reads clipboard and calls the provided setter.
export function useClipboardPaste(onPaste: (text: string) => void) {
  return useCallback(async () => {
    try {
      const text = await backendApi.getClipboard()
      if (text) onPaste(text)
    } catch {
      // todo
    }
  }, [onPaste])
}
