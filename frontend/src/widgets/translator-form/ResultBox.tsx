import type { AsyncState, TranslationDTO } from '@/shared/types'
import { Spinner } from '@/shared/ui'
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

  const lines = state.data.result.split('\n')

  return (
    <div className={`${styles.resultBase} ${styles.resultAnimated}`}>
      <div className={styles.resultLabel}>Перевод</div>
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
