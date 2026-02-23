import { useState } from 'react'
import { IconChevronDown, IconChevronUp, IconTrash, IconHistory } from '@/shared/ui'
import { useTranslatorContext } from '@/pages/translator/context'
import { HistoryItem } from './HistoryItem'
import styles from './history-panel.module.css'

export function HistoryPanel() {
  const { history: items, onHistorySelect: onSelect, onClearHistory: onClear } = useTranslatorContext()
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.panel}>
      <button type="button" onClick={() => setOpen(o => !o)} className={styles.toggleButton}>
        <div className={styles.toggleLeft}>
          <IconHistory size={18} />
          <span className={styles.toggleLabel}>История</span>
          {items.length > 0 && <span className={styles.badge}>{items.length}</span>}
        </div>
        <div className={styles.toggleRight}>
          {open && items.length > 0 && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onClear()
              }}
              title="Очистить историю"
              className={styles.clearButton}
            >
              <IconTrash size={16} />
              Очистить
            </button>
          )}
          <span className={styles.toggleChevron}>
            {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </span>
        </div>
      </button>
      {open && (
        <div className={`${styles.list} ${styles.listScrollbar}`}>
          {items.length === 0 ? (
            <div className={styles.empty}>История пуста</div>
          ) : (
            items.map(item => <HistoryItem key={item.id} item={item} onSelect={() => onSelect(item)} />)
          )}
        </div>
      )}
    </div>
  )
}