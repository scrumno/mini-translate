import { Divider, IconMinus, IconX, WindowButton, IconPin, IconPinOff, IconSettings } from '@/shared/ui'
import { Quit, WindowMinimise } from '../../../wailsjs/runtime'
import styles from './translator-page.module.css'

interface TitlebarProps {
  pinned: boolean
  onTogglePin: () => void
  onOpenSettings?: () => void
}

export function Titlebar({ pinned, onTogglePin, onOpenSettings }: TitlebarProps) {
  const handleMinimise = () => WindowMinimise()
  const handleClose = () => Quit()

  return (
    <div className={styles.titlebar} style={{ ['--wails-draggable' as string]: 'drag' }}>
      <span className={styles.titlebarTitle}>Переводчик by scrumno</span>
      <div className={styles.titlebarControls} style={{ ['--wails-draggable' as string]: 'no-drag' }}>
        {onOpenSettings && (
          <WindowButton onClick={onOpenSettings} title="Настройки">
            <IconSettings size={18} />
          </WindowButton>
        )}
        <WindowButton onClick={onTogglePin} title={pinned ? 'Открепить' : 'Закрепить поверх'}>
          {pinned ? <IconPin size={18} /> : <IconPinOff size={18} />}
        </WindowButton>
        <WindowButton onClick={handleMinimise} title="Свернуть">
          <IconMinus size={18} />
        </WindowButton>
        <WindowButton onClick={handleClose} title="Закрыть" danger>
          <IconX size={18} />
        </WindowButton>
      </div>
    </div>
  )
}
