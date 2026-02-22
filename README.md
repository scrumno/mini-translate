# Translator App — Setup Guide (Windows)

## Что получишь

Минималистичное нативное приложение поверх всех окон:
- Перевод через Google Translate (бесплатно)
- Хоткей `Ctrl+Shift+T` — автовставка из буфера обмена + перевод
- История 100 последних переводов
- Pin/Unpin окна одной кнопкой
- Enter — переводит, Shift+Enter — перенос строки

---

## Шаг 1 — Установи зависимости

### 1.1 Go
Скачай и установи: https://go.dev/dl/  
Выбери `go1.21.x.windows-amd64.msi`

Проверь:
```cmd
go version
# go version go1.21.x windows/amd64
```

### 1.2 Node.js
Скачай: https://nodejs.org/ (LTS версия)

Проверь:
```cmd
node --version
# v20.x.x
```

### 1.3 WebView2 (обычно уже есть на Windows 11)
Если не установлен: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 1.4 Wails CLI
```cmd
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Добавь Go bin в PATH (если не добавлен автоматически):
```cmd
# Обычно это C:\Users\<ИМЯ>\go\bin
# Добавь в System Environment Variables → Path
```

Проверь установку:
```cmd
wails doctor
```
Всё должно быть зелёным ✓

---

## Шаг 2 — Установи зависимости проекта

```cmd
cd translator-app

# Go зависимости
go mod tidy

# Frontend зависимости
cd frontend
npm install
cd ..
```

---

## Шаг 3 — Запуск в режиме разработки

```cmd
wails dev
```

Откроется окно приложения с hot reload.  
Изменения в React файлах обновляются мгновенно.  
Изменения в Go требуют перезапуска.

---

## Шаг 4 — Сборка релиза

```cmd
wails build
```

Готовый `.exe` появится в:
```
build/bin/translator.exe
```

Размер: ~10-15 МБ. Одиночный исполняемый файл, ничего не нужно устанавливать.

### Сборка с иконкой (опционально)

Положи иконку `appicon.png` (256x256) в папку `build/` и Wails автоматически её встроит.

---

## Использование хоткея

1. Выдели любое слово/текст в любом приложении
2. Скопируй: `Ctrl+C`
3. Нажми: `Ctrl+Shift+T`
4. Приложение вынесется на передний план и автоматически переведёт

---

## Структура проекта (для понимания)

```
translator-app/
├── main.go                          # Точка входа Wails
├── go.mod
├── wails.json
│
├── internal/
│   ├── domain/translation/          # Доменный слой (чистый Go, нет зависимостей)
│   │   ├── domain.go                # Entities, Interfaces (Repository, Translator)
│   │   └── usecase.go               # Use cases
│   │
│   ├── infrastructure/              # Адаптеры (реализуют доменные интерфейсы)
│   │   ├── translator/google.go     # Google Translate HTTP adapter
│   │   ├── history/json_repo.go     # JSON файловый репозиторий
│   │   ├── clipboard/service.go     # Чтение буфера обмена
│   │   └── hotkey/service.go        # Глобальные хоткеи
│   │
│   ├── interfaces/                  # DTOs + маппинг domain ↔ DTO
│   │   ├── dto.go
│   │   └── mapper.go
│   │
│   └── app/application.go           # Composition root + Wails bindings
│
└── frontend/src/
    ├── app/                         # Инициализация React приложения
    ├── pages/translator/            # Страница — собирает виджеты, подключает фичи
    ├── widgets/                     # Немые UI компоненты (только props + callbacks)
    │   ├── translator-form/
    │   └── history-panel/
    ├── features/                    # Изолированные фичи с бизнес-логикой
    │   ├── translate/               # Хук перевода
    │   ├── clipboard/               # Хук чтения буфера
    │   ├── hotkey/                  # Хук глобального хоткея
    │   └── pin-window/              # Хук закрепления окна
    ├── entities/translation/        # Модель данных перевода, useTranslationEntity
    └── shared/                      # Переиспользуемые примитивы
        ├── api/backend.ts           # Все вызовы к Go backend
        ├── types/                   # Общие TypeScript типы
        └── ui/                      # Базовые UI компоненты (Button, Select, Textarea...)
```

---

## Архитектурные принципы

| Принцип | Реализация |
|---|---|
| **DDD** | Domain layer изолирован, нет внешних зависимостей. Infrastructure реализует доменные интерфейсы. |
| **SOLID / DIP** | UseCase зависит от `Translator` и `Repository` интерфейсов, не от конкретных реализаций. |
| **SOLID / SRP** | Каждый пакет — одна ответственность. Mapper отдельно от DTO. |
| **FSD** | Frontend слои: shared → entities → features → widgets → pages. Зависимости только вниз. |
| **Dumb components** | Все UI компоненты получают данные через props, событи — через callbacks. Нет внутренней логики. |
| **Declarative UI** | Состояние → View. Никаких императивных DOM манипуляций. |

---

## Возможные проблемы

### `wails doctor` показывает ошибку WebView2
→ Установи WebView2 Runtime: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Ошибка `go: command not found`
→ Go не в PATH. Переоткрой терминал после установки Go.

### Хоткей не срабатывает
→ Убедись что приложение запущено. На некоторых системах требуются права администратора для глобальных хоткеев.

### `wails: command not found`
→ `C:\Users\<ИМЯ>\go\bin` не в PATH. Добавь в Environment Variables.
