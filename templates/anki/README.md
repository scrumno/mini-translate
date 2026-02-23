# Anki: note types and styles

The app creates notes in Anki via AnkiConnect. Create these note types and decks in Anki first.

---

## Note type for words: TranslatorWord

### 1. Create note type and fields

- **Tools** → **Manage Note Types** → **Add** → name: `TranslatorWord`.
- **Fields** (add in this order): `Word`, `Translation`, `Transcription`, `PartOfSpeech`, `Definition`, `Example_EN`, `Example_RU`, `Context`, `Tags`, `Source`, `Added`.

### 2. Card templates

В **Cards** у типа TranslatorWord нужно три карточки. Для каждой — **Front Template** (лицевая) и **Back Template** (оборотная).

---

**Карточка 1 — Узнавание (EN → RU)**

- **Name:** `EN → RU`
- **Front Template:**
```html
<div class="card-inner">
  <div class="word">{{Word}}</div>
  {{#Transcription}}<div class="tr">{{Transcription}}</div>{{/Transcription}}
  {{#PartOfSpeech}}<div class="pos">{{PartOfSpeech}}</div>{{/PartOfSpeech}}

  {{#Definition}}
  <div class="sec">
    <div class="lbl">Definition</div>
    <div class="def">{{Definition}}</div>
  </div>
  {{/Definition}}
</div>
```
- **Back Template:**
```html
<div class="card-inner">
  <div class="word-sm">{{Word}}</div>
  <hr class="hr">
  <div class="tl">{{Translation}}</div>

  {{#Example_EN}}
  <div class="sec">
    <div class="lbl">Example</div>
    <div class="ex">{{Example_EN}}</div>
  </div>
  {{/Example_EN}}
  {{#Example_RU}}<div class="ex-ru">{{Example_RU}}</div>{{/Example_RU}}
  {{#Tags}}<div class="tags">{{Tags}}</div>{{/Tags}}
</div>
```

---

**Карточка 2 — Производство (RU → EN)**

- **Name:** `RU → EN`
- **Front Template:**
```html
<div class="card-inner">
  <div class="tl" style="font-size:1.8em">{{Translation}}</div>
  {{#PartOfSpeech}}<div class="pos">{{PartOfSpeech}}</div>{{/PartOfSpeech}}
  <div class="prompt">How do you say this in English?</div>
</div>
```
- **Back Template:**
```html
<div class="card-inner">
  <div class="tl-sm">{{Translation}}</div>
  <hr class="hr">
  <div class="word">{{Word}}</div>
  {{#Transcription}}<div class="tr">{{Transcription}}</div>{{/Transcription}}

  {{#Definition}}
  <div class="sec">
    <div class="lbl">Definition</div>
    <div class="def">{{Definition}}</div>
  </div>
  {{/Definition}}

  {{#Example_EN}}
  <div class="sec">
    <div class="lbl">Example</div>
    <div class="ex">{{Example_EN}}</div>
  </div>
  {{/Example_EN}}
</div>
```

---

**Карточка 3 — Контекстная (по примеру)**

Показывается только если есть пример. Отключите «Allow empty fields» или используйте условный рендер.

- **Name:** `Context`
- **Front Template:**
```html
<div class="card-inner">
  <div class="phrase-sm">Fill in the blank:</div>
  {{#Example_EN}}
  <div class="ctx">{{Example_EN}}</div>
  {{/Example_EN}}
  {{#PartOfSpeech}}<div class="pos">{{PartOfSpeech}}</div>{{/PartOfSpeech}}
</div>
```
- **Back Template:**
```html
<div class="card-inner">
  <div class="word">{{Word}}</div>
  {{#Transcription}}<div class="tr">{{Transcription}}</div>{{/Transcription}}
  <hr class="hr">
  <div class="tl">{{Translation}}</div>

  {{#Definition}}
  <div class="sec">
    <div class="lbl">Definition</div>
    <div class="def">{{Definition}}</div>
  </div>
  {{/Definition}}
</div>
```

(Если не хотите третью карточку — можно оставить только две.)

### 3. Styling

Вкладка **Styling** → вставьте содержимое файла `card-styles.css` из этой папки.

---

## Note type for phrases: TranslatorPhrase

### 1. Create note type and fields

- **Add** тип `TranslatorPhrase`.
- **Fields:** `Phrase`, `Translation`, `Example_EN`, `Example_RU`, `Context`, `Tags`, `Added`.

### 2. Card templates

**Карточка 1 — Что значит фраза (EN → RU)**

- **Name:** `EN → RU`
- **Front Template:**
```html
<div class="card-inner">
  <div class="phrase">{{Phrase}}</div>
  <div class="badge">idiom / phrase</div>
</div>
```
- **Back Template:**
```html
<div class="card-inner">
  <div class="phrase-sm">{{Phrase}}</div>
  <hr class="hr">
  <div class="tl">{{Translation}}</div>

  {{#Example_EN}}
  <div class="sec">
    <div class="lbl">Example</div>
    <div class="ex">{{Example_EN}}</div>
  </div>
  {{/Example_EN}}
  {{#Example_RU}}<div class="ex-ru">{{Example_RU}}</div>{{/Example_RU}}
  {{#Tags}}<div class="tags">{{Tags}}</div>{{/Tags}}
</div>
```

**Карточка 2 — Как выразить (RU → EN)**

- **Name:** `RU → EN`
- **Front Template:**
```html
<div class="card-inner">
  <div class="tl" style="font-size:1.5em">{{Translation}}</div>
  <div class="badge">idiom / phrase</div>
  <div class="prompt">How do you say this in English?</div>
</div>
```
- **Back Template:**
```html
<div class="card-inner">
  <div class="tl-sm">{{Translation}}</div>
  <hr class="hr">
  <div class="phrase">{{Phrase}}</div>

  {{#Example_EN}}
  <div class="sec">
    <div class="lbl">Example</div>
    <div class="ex">{{Example_EN}}</div>
  </div>
  {{/Example_EN}}
</div>
```

### 3. Styling

То же, что у TranslatorWord — вставьте `card-styles.css`.

---

## Decks

Create decks or set in settings: `ANKI_DECK_WORDS` (e.g. `English/Words/Default`), `ANKI_DECK_PHRASES` (e.g. `English/Phrases`).

## AnkiConnect

Install the AnkiConnect plugin in Anki and keep Anki running when using the «В Anki» button in the app.
