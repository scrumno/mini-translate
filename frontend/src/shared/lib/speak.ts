const langMap: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ar: 'ar-SA',
  pt: 'pt-BR',
  it: 'it-IT',
  pl: 'pl-PL',
  tr: 'tr-TR',
  uk: 'uk-UA',
}

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, lang: string): void {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langMap[lang] || lang
  utterance.rate = 0.9
  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel()
  currentUtterance = null
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
