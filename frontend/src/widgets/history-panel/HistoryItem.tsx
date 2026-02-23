import type { TranslationDTO } from '@/shared/types'
import styles from './history-panel.module.css'

interface HistoryItemProps {
  item: TranslationDTO
  onSelect: () => void
}

export function HistoryItem({ item, onSelect }: HistoryItemProps) {
  return (
    <button type="button" onClick={onSelect} className={styles.item}>
      <span className={styles.itemSource}>{item.source}</span>
      <span className={styles.itemResult}>{item.result}</span>
    </button>
  )
}
