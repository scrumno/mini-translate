import { WindowMinimise } from '../../../wailsjs/runtime'
import { Button, IconMinus } from '@/shared/ui'
import styles from './compact-mode.module.css'

interface CompactModeProps {
  ankiHotkey?: string
  toast?: string | null
}

export function CompactMode({ ankiHotkey, toast }: CompactModeProps) {
  return (
    <div className={styles.root}>
      {toast ? (
        <span className={styles.notification}>{toast}</span>
      ) : (
        <>
          <Button onClick={() => WindowMinimise()} size="sm" variant="ghost" title="Свернуть окно">
            <IconMinus size={14} />
            Свернуть
          </Button>
          {ankiHotkey && (
            <span className={styles.hint}>{formatHotkey(ankiHotkey)} → Anki</span>
          )}
        </>
      )}
    </div>
  )
}

function formatHotkey(hotkey: string): string {
  return hotkey
    .split('+')
    .map(k => k.charAt(0).toUpperCase() + k.slice(1))
    .join('+')
}
