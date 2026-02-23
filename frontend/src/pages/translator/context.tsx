import { createContext, useContext, type ReactNode } from 'react'
import type { LanguageDTO, AsyncState, TranslationDTO } from '@/shared/types'

export interface TranslatorContextValue {
  inputText: string
  setInputText: (v: string) => void
  fromLang: string
  setFromLang: (v: string) => void
  toLang: string
  setToLang: (v: string) => void
  languages: LanguageDTO[]
  translationState: AsyncState<TranslationDTO>
  onTranslate: () => void
  onPasteClipboard: () => void
  onSwapLanguages: () => void
  history: TranslationDTO[]
  onHistorySelect: (item: TranslationDTO) => void
  onClearHistory: () => void
}

const TranslatorContext = createContext<TranslatorContextValue | null>(null)

export function TranslatorProvider({ value, children }: { value: TranslatorContextValue; children: ReactNode }) {
  return <TranslatorContext.Provider value={value}>{children}</TranslatorContext.Provider>
}

export function useTranslatorContext(): TranslatorContextValue {
  const ctx = useContext(TranslatorContext)
  if (!ctx) throw new Error('useTranslatorContext must be used within TranslatorProvider')
  return ctx
}
