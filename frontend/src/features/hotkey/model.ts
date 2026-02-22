import { useEffect } from 'react'

// useHotkeyPaste subscribes to the 'hotkey:paste' event emitted by Go
// when the user triggers Ctrl+Shift+T with selected text in clipboard.
export function useHotkeyPaste(onPaste: (text: string) => void) {
  useEffect(() => {
    // wailsjs runtime is injected globally by Wails
    const runtime = window.runtime
    if (!runtime) return

    runtime.EventsOn('hotkey:paste', (text: unknown) => {
      if (typeof text === 'string' && text.trim()) {
        onPaste(text)
      }
    })

    return () => {
      runtime.EventsOff('hotkey:paste')
    }
  }, [onPaste])
}
