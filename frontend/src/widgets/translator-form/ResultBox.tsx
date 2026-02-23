import type { AsyncState, TranslationDTO } from '@/shared/types'
import { Spinner, IconVolume, WindowButton } from '@/shared/ui'
import { speak, isSpeechSupported } from '@/shared/lib/speak'
import styles from './translator-form.module.css'

interface ResultBoxProps {
  state: AsyncState<TranslationDTO>
}

export function ResultBox({ state }: ResultBoxProps) {
  if (state.status === 'idle') return null

  if (state.status === 'loading') {
    return (
      <div className={`${styles.resultBase} ${styles.resultLoading}`}>
        <Spinner size={16} />
        Перевод...
      </div>
    )
  }

  if (state.status === 'error') {
    return <div className={`${styles.resultBase} ${styles.resultError}`}>{state.error}</div>
  }

  const { source, result, fromLang, toLang } = state.data
  const lines = result.split('\n')
  const canSpeak = isSpeechSupported()

  return (
    <div className={`${styles.resultBase} ${styles.resultAnimated}`}>
      <div className={styles.resultHeader}>
        <div className={styles.resultLabel}>Перевод</div>
        {canSpeak && (
          <div className={styles.speakRow}>
            <WindowButton onClick={() => speak(source, fromLang)} title="Озвучить оригинал">
              <IconVolume size={14} />
            </WindowButton>
            <WindowButton onClick={() => speak(result, toLang)} title="Озвучить перевод">
              <IconVolume size={14} />
            </WindowButton>
          </div>
        )}
      </div>
      <div className={styles.resultText}>
        {lines.map((line, i) => (
          <div key={i} className={styles.resultLine}>
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  )
}
