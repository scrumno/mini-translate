package interfaces

// TranslationDTO is the data transfer object returned to the frontend.
type TranslationDTO struct {
	ID        string `json:"id"`
	Source    string `json:"source"`
	Result    string `json:"result"`
	FromLang  string `json:"fromLang"`
	ToLang    string `json:"toLang"`
	CreatedAt string `json:"createdAt"`
}

// TranslateRequestDTO is the data transfer object received from the frontend.
type TranslateRequestDTO struct {
	Text     string `json:"text"`
	FromLang string `json:"fromLang"`
	ToLang   string `json:"toLang"`
}

// LanguageDTO is the data transfer object for language options.
type LanguageDTO struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

// DictionaryEntryDTO is the data transfer object for dictionary lookup (transcription, examples).
type DictionaryEntryDTO struct {
	Word          string   `json:"word"`
	Transcription string   `json:"transcription"`
	PartOfSpeech  string   `json:"partOfSpeech"`
	Definitions   []string `json:"definitions"`
	Examples      []string `json:"examples"`
}

// SaveToAnkiRequestDTO is the request to save a translation to Anki.
type SaveToAnkiRequestDTO struct {
	Source        string `json:"source"`
	Result        string `json:"result"`
	FromLang      string `json:"fromLang"`
	ToLang        string `json:"toLang"`
	IsPhrase      bool   `json:"isPhrase"`
	Transcription string `json:"transcription,omitempty"`
	PartOfSpeech  string `json:"partOfSpeech,omitempty"`
	ExampleEN     string `json:"exampleEN,omitempty"`
	ExampleRU     string `json:"exampleRU,omitempty"`
	Context       string `json:"context,omitempty"`
	Tags          string `json:"tags,omitempty"`
}

// SaveToAnkiResponseDTO is the response after saving to Anki.
type SaveToAnkiResponseDTO struct {
	NoteID int64  `json:"noteId"`
	Error  string `json:"error,omitempty"`
}

// SaveToObsidianRequestDTO is the request to save a translation to Obsidian.
type SaveToObsidianRequestDTO struct {
	Source        string `json:"source"`
	Result        string `json:"result"`
	FromLang      string `json:"fromLang"`
	ToLang        string `json:"toLang"`
	IsPhrase      bool   `json:"isPhrase"`
	Transcription string `json:"transcription,omitempty"`
	PartOfSpeech  string `json:"partOfSpeech,omitempty"`
	ExampleEN     string `json:"exampleEN,omitempty"`
	ExampleRU     string `json:"exampleRU,omitempty"`
	Context       string `json:"context,omitempty"`
	Tags          string `json:"tags,omitempty"`
}

// SaveToObsidianResponseDTO is the response after saving to Obsidian.
type SaveToObsidianResponseDTO struct {
	Path  string `json:"path,omitempty"`
	Error string `json:"error,omitempty"`
}

// ConfigDTO is the app configuration exposed to the frontend (get/save settings).
type ConfigDTO struct {
	TranslatorDebug     bool   `json:"translatorDebug"`
	ViteDebug           bool   `json:"viteDebug"`
	AnkiConnectURL      string `json:"ankiConnectUrl"`
	AnkiDeckWords       string `json:"ankiDeckWords"`
	AnkiDeckPhrases     string `json:"ankiDeckPhrases"`
	AnkiNoteTypeWords   string `json:"ankiNoteTypeWords"`
	AnkiNoteTypePhrases string `json:"ankiNoteTypePhrases"`
	ObsidianVaultPath   string `json:"obsidianVaultPath"`
	Hotkey              string `json:"hotkey"`
}
