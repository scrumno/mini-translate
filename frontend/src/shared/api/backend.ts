// Thin wrapper around Wails-generated Go bindings.
// Centralises all backend calls so features depend on this, not on raw Wails bindings.

import type { TranslateRequestDTO, TranslationDTO, LanguageDTO } from '@/shared/types'

// Wails binds Go methods to `window.go.<package>.<Type>.<Method>`
// We access them via the globally injected bindings.
declare global {
  interface Window {
    go: {
      app: {
        Application: {
          Translate(req: TranslateRequestDTO): Promise<TranslationDTO>
          GetHistory(): Promise<TranslationDTO[]>
          ClearHistory(): Promise<void>
          GetClipboard(): Promise<string>
          GetLanguages(): Promise<LanguageDTO[]>
          ToggleAlwaysOnTop(enabled: boolean): Promise<void>
        }
      }
    }
    runtime: {
      EventsOn(event: string, callback: (...data: unknown[]) => void): void
      EventsOff(event: string): void
      WindowHide(): void
      WindowShow(): void
    }
  }
}

const api = window.go.app.Application

export const backendApi = {
  translate: (req: TranslateRequestDTO): Promise<TranslationDTO> =>
    api.Translate(req),

  getHistory: (): Promise<TranslationDTO[]> =>
    api.GetHistory(),

  clearHistory: (): Promise<void> =>
    api.ClearHistory(),

  getClipboard: (): Promise<string> =>
    api.GetClipboard(),

  getLanguages: (): Promise<LanguageDTO[]> =>
    api.GetLanguages(),

  toggleAlwaysOnTop: (enabled: boolean): Promise<void> =>
    api.ToggleAlwaysOnTop(enabled),
}
