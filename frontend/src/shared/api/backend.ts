// Thin wrapper around Wails-generated Go bindings.
// Centralises all backend calls so features depend on this, not on raw Wails bindings.

import type {
  TranslateRequestDTO,
  TranslationDTO,
  LanguageDTO,
  DictionaryEntryDTO,
  SaveToAnkiRequestDTO,
  SaveToAnkiResponseDTO,
  ConfigDTO,
} from '@/shared/types'
import { log } from '@/shared/lib/logger'

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
          LookupDictionary(word: string, lang: string): Promise<DictionaryEntryDTO | null>
          SaveToAnki(req: SaveToAnkiRequestDTO): Promise<SaveToAnkiResponseDTO>
          TranslateAndSaveToAnki(): Promise<SaveToAnkiResponseDTO>
          GetConfig(): Promise<ConfigDTO>
          SaveConfig(c: ConfigDTO): Promise<void>
        }
      }
    }
    runtime: {
      EventsOn(event: string, callback: (...data: unknown[]) => void): void
      EventsOff(event: string): void
      WindowHide(): void
      WindowShow(): void
      WindowSetSize?(width: number, height: number): void
    }
  }
}

const api = window.go.app.Application

export const backendApi = {
  translate: async (req: TranslateRequestDTO): Promise<TranslationDTO> => {
    log('[backend] translate', req)
    const out = await api.Translate(req)
    log('[backend] translate result', out)
    return out
  },

  getHistory: async (): Promise<TranslationDTO[]> => {
    log('[backend] getHistory')
    const out = await api.GetHistory()
    log('[backend] getHistory result', out?.length ?? 0, 'items')
    return out
  },

  clearHistory: async (): Promise<void> => {
    log('[backend] clearHistory')
    await api.ClearHistory()
  },

  getClipboard: async (): Promise<string> => {
    log('[backend] getClipboard')
    return api.GetClipboard()
  },

  getLanguages: async (): Promise<LanguageDTO[]> => {
    log('[backend] getLanguages')
    const out = await api.GetLanguages()
    log('[backend] getLanguages result', out?.length ?? 0, 'items')
    return out
  },

  toggleAlwaysOnTop: async (enabled: boolean): Promise<void> => {
    log('[backend] toggleAlwaysOnTop', enabled)
    await api.ToggleAlwaysOnTop(enabled)
  },

  lookupDictionary: async (word: string, lang: string): Promise<DictionaryEntryDTO | null> => {
    log('[backend] lookupDictionary', word, lang)
    const out = await api.LookupDictionary(word, lang)
    return out ?? null
  },

  saveToAnki: async (req: SaveToAnkiRequestDTO): Promise<SaveToAnkiResponseDTO> => {
    log('[backend] saveToAnki', req)
    return api.SaveToAnki(req)
  },

  translateAndSaveToAnki: async (): Promise<SaveToAnkiResponseDTO> => {
    log('[backend] translateAndSaveToAnki')
    return api.TranslateAndSaveToAnki()
  },

  getConfig: async (): Promise<ConfigDTO> => {
    log('[backend] getConfig')
    return api.GetConfig()
  },

  saveConfig: async (c: ConfigDTO): Promise<void> => {
    log('[backend] saveConfig', c)
    await api.SaveConfig(c)
  },
}
