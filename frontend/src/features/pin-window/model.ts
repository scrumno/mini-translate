import { useState, useCallback } from 'react'
import { backendApi } from '@/shared/api/backend'

// usePinWindow - feature hook.
// Toggles the always-on-top state of the native window.
export function usePinWindow(initial = true) {
  const [pinned, setPinned] = useState(initial)

  const toggle = useCallback(async () => {
    const next = !pinned
    setPinned(next)
    await backendApi.toggleAlwaysOnTop(next)
  }, [pinned])

  return { pinned, toggle }
}
