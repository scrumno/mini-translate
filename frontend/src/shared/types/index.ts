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

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
