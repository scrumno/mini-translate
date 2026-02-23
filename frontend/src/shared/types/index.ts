// These types mirror the Go DTOs in internal/interfaces/dto.go

export interface TranslationDTO {
  id: string
  source: string
  result: string
  fromLang: string
  toLang: string
  createdAt: string
}

export interface TranslateRequestDTO {
  text: string
  fromLang: string
  toLang: string
}

export interface LanguageDTO {
  code: string
  name: string
}

export interface DictionaryEntryDTO {
  word: string
  transcription: string
  partOfSpeech: string
  definitions: string[]
  examples: string[]
}

export interface SaveToAnkiRequestDTO {
  source: string
  result: string
  fromLang: string
  toLang: string
  isPhrase: boolean
  transcription?: string
  partOfSpeech?: string
  exampleEN?: string
  exampleRU?: string
  context?: string
  tags?: string
}

export interface SaveToAnkiResponseDTO {
  noteId: number
  error?: string
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

export interface ConfigDTO {
  translatorDebug: boolean
  viteDebug: boolean
  ankiConnectUrl: string
  ankiDeckWords: string
  ankiDeckPhrases: string
  ankiNoteTypeWords: string
  ankiNoteTypePhrases: string
  autoAddToAnki: boolean
  ankiAutoSync: boolean
  compactMode: boolean
  dictionaryProvider: string
  yandexDictionaryApiKey: string
  hotkey: string
  hotkeyAddToAnki: string
}
