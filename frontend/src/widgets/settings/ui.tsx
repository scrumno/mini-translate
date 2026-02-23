import { useEffect, useState, type KeyboardEvent } from 'react'
import { Button, IconX } from '@/shared/ui'
import { backendApi } from '@/shared/api/backend'
import type { ConfigDTO } from '@/shared/types'
import styles from './settings-modal.module.css'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [config, setConfig] = useState<ConfigDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setLoading(true)
    backendApi
      .getConfig()
      .then(c => setConfig(c))
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [open])

  const handleSave = async () => {
    if (!config) return
    setError(null)
    setSaving(true)
    try {
      await backendApi.saveConfig(config)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Настройки</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconX size={20} />
          </button>
        </div>

        {loading && <p className={styles.hint}>Загрузка…</p>}
        {error && <p style={{ color: 'var(--color-danger)', marginBottom: 12, fontSize: 'var(--font-size-sm)' }}>{error}</p>}

        {config && (
          <>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Отладка</div>
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="translatorDebug"
                    className={styles.checkbox}
                    checked={config.translatorDebug}
                    onChange={e => setConfig({ ...config, translatorDebug: e.target.checked })}
                  />
                  <label htmlFor="translatorDebug" className={styles.checkboxLabel}>
                    Логи бэкенда (TRANSLATOR_DEBUG)
                  </label>
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="viteDebug"
                    className={styles.checkbox}
                    checked={config.viteDebug}
                    onChange={e => setConfig({ ...config, viteDebug: e.target.checked })}
                  />
                  <label htmlFor="viteDebug" className={styles.checkboxLabel}>
                    Логи фронта (VITE_DEBUG)
                  </label>
                </div>
                <div className={styles.hint}>Применится после перезапуска приложения</div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Anki (AnkiConnect)</div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ankiConnectUrl">
                  URL AnkiConnect
                </label>
                <input
                  id="ankiConnectUrl"
                  type="text"
                  className={styles.input}
                  value={config.ankiConnectUrl}
                  onChange={e => setConfig({ ...config, ankiConnectUrl: e.target.value })}
                  placeholder="http://127.0.0.1:8765"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ankiDeckWords">
                  Колода для слов
                </label>
                <input
                  id="ankiDeckWords"
                  type="text"
                  className={styles.input}
                  value={config.ankiDeckWords}
                  onChange={e => setConfig({ ...config, ankiDeckWords: e.target.value })}
                  placeholder="English/Words/Default"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ankiDeckPhrases">
                  Колода для фраз
                </label>
                <input
                  id="ankiDeckPhrases"
                  type="text"
                  className={styles.input}
                  value={config.ankiDeckPhrases}
                  onChange={e => setConfig({ ...config, ankiDeckPhrases: e.target.value })}
                  placeholder="English/Phrases"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ankiNoteTypeWords">
                  Тип заметки (слова)
                </label>
                <input
                  id="ankiNoteTypeWords"
                  type="text"
                  className={styles.input}
                  value={config.ankiNoteTypeWords}
                  onChange={e => setConfig({ ...config, ankiNoteTypeWords: e.target.value })}
                  placeholder="TranslatorWord"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ankiNoteTypePhrases">
                  Тип заметки (фразы)
                </label>
                <input
                  id="ankiNoteTypePhrases"
                  type="text"
                  className={styles.input}
                  value={config.ankiNoteTypePhrases}
                  onChange={e => setConfig({ ...config, ankiNoteTypePhrases: e.target.value })}
                  placeholder="TranslatorPhrase"
                />
              </div>
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="autoAddToAnki"
                    className={styles.checkbox}
                    checked={config.autoAddToAnki}
                    onChange={e => setConfig({ ...config, autoAddToAnki: e.target.checked })}
                  />
                  <label htmlFor="autoAddToAnki" className={styles.checkboxLabel}>
                    Автоматически добавлять перевод в Anki
                  </label>
                </div>
                <div className={styles.hint}>После каждого перевода карточка создаётся автоматически</div>
              </div>
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="ankiAutoSync"
                    className={styles.checkbox}
                    checked={config.ankiAutoSync}
                    onChange={e => setConfig({ ...config, ankiAutoSync: e.target.checked })}
                  />
                  <label htmlFor="ankiAutoSync" className={styles.checkboxLabel}>
                    Синхронизировать с AnkiWeb после добавления
                  </label>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Горячая клавиша</div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="hotkey">
                  Автовставка из буфера
                </label>
                <input
                  id="hotkey"
                  type="text"
                  className={styles.input}
                  value={config.hotkey}
                  readOnly
                  placeholder="Нажмите комбинацию клавиш…"
                  onFocus={e => {
                    e.currentTarget.value = 'Нажмите комбинацию…'
                    e.currentTarget.dataset.recording = 'true'
                  }}
                  onBlur={e => {
                    e.currentTarget.value = config.hotkey
                    delete e.currentTarget.dataset.recording
                  }}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.currentTarget.dataset.recording !== 'true') return
                    e.preventDefault()
                    const parts: string[] = []
                    if (e.ctrlKey) parts.push('ctrl')
                    if (e.shiftKey) parts.push('shift')
                    if (e.altKey) parts.push('alt')
                    const key = e.key.toLowerCase()
                    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
                      parts.push(key)
                      const combo = parts.join('+')
                      setConfig({ ...config, hotkey: combo })
                      e.currentTarget.value = combo
                      delete e.currentTarget.dataset.recording
                      e.currentTarget.blur()
                    }
                  }}
                />
                <div className={styles.hint}>Нажмите на поле и введите комбинацию. Применится после перезапуска.</div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="hotkeyAddToAnki">
                  Добавить в Anki из буфера
                </label>
                <input
                  id="hotkeyAddToAnki"
                  type="text"
                  className={styles.input}
                  value={config.hotkeyAddToAnki}
                  readOnly
                  placeholder="Нажмите комбинацию клавиш…"
                  onFocus={e => {
                    e.currentTarget.value = 'Нажмите комбинацию…'
                    e.currentTarget.dataset.recording = 'true'
                  }}
                  onBlur={e => {
                    e.currentTarget.value = config.hotkeyAddToAnki
                    delete e.currentTarget.dataset.recording
                  }}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.currentTarget.dataset.recording !== 'true') return
                    e.preventDefault()
                    const parts: string[] = []
                    if (e.ctrlKey) parts.push('ctrl')
                    if (e.shiftKey) parts.push('shift')
                    if (e.altKey) parts.push('alt')
                    const key = e.key.toLowerCase()
                    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
                      parts.push(key)
                      const combo = parts.join('+')
                      setConfig({ ...config, hotkeyAddToAnki: combo })
                      e.currentTarget.value = combo
                      delete e.currentTarget.dataset.recording
                      e.currentTarget.blur()
                    }
                  }}
                />
                <div className={styles.hint}>Буфер → перевод → Anki. Применится после перезапуска.</div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Словарь</div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="dictionaryProvider">
                  Провайдер словаря
                </label>
                <select
                  id="dictionaryProvider"
                  className={styles.input}
                  value={config.dictionaryProvider || 'free'}
                  onChange={e => setConfig({ ...config, dictionaryProvider: e.target.value })}
                >
                  <option value="free">Free Dictionary (EN)</option>
                  <option value="yandex">Yandex.Словарь</option>
                  <option value="yandex+free">Yandex + Free (fallback)</option>
                </select>
              </div>
              {(config.dictionaryProvider === 'yandex' || config.dictionaryProvider === 'yandex+free') && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="yandexDictionaryApiKey">
                    API-ключ Yandex.Словарь
                  </label>
                  <input
                    id="yandexDictionaryApiKey"
                    type="password"
                    className={styles.input}
                    value={config.yandexDictionaryApiKey}
                    onChange={e => setConfig({ ...config, yandexDictionaryApiKey: e.target.value })}
                    placeholder="Ключ из Yandex Cloud"
                  />
                  <div className={styles.hint}>Получите ключ на developer.tech.yandex.ru</div>
                </div>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>Режим</div>
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="compactMode"
                    className={styles.checkbox}
                    checked={config.compactMode}
                    onChange={e => setConfig({ ...config, compactMode: e.target.checked })}
                  />
                  <label htmlFor="compactMode" className={styles.checkboxLabel}>
                    Компактный режим при запуске
                  </label>
                </div>
                <div className={styles.hint}>Маленькое окно. Добавляйте слова в Anki по горячей клавише.</div>
              </div>
            </section>

            <div className={styles.actions}>
              <Button onClick={onClose} variant="ghost" size="sm">
                Отмена
              </Button>
              <Button onClick={handleSave} loading={saving} disabled={saving} size="sm">
                Сохранить
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
