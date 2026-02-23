package app

import (
	"context"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	domain "translator/internal/domain/translation"
	"translator/internal/infrastructure/anki"
	"translator/internal/infrastructure/clipboard"
	"translator/internal/infrastructure/dictionary"
	"translator/internal/infrastructure/history"
	"translator/internal/infrastructure/obsidian"
	"translator/internal/infrastructure/hotkey"
	"translator/internal/infrastructure/translator"
	"translator/internal/interfaces"
	"translator/internal/pkg/logger"
)

type Application struct {
	ctx           context.Context
	useCase       *domain.UseCase
	clipboard     *clipboard.Service
	dictionary    *dictionary.Client
	anki          *anki.Client
	obsidianVault *obsidian.Vault
	config        *Config
	configPath    string
}

func NewApplication() *Application {
	return &Application{}
}

func (a *Application) Startup(ctx context.Context) {
	a.ctx = ctx

	configPath, err := ConfigPath()
	if err != nil {
		logger.Debugf("config path: %v", err)
		configPath = ""
	}
	a.configPath = configPath
	if configPath != "" {
		a.config, err = LoadConfig(configPath)
		if err != nil {
			logger.Debugf("load config: %v", err)
			a.config = ConfigFromEnv()
		}
	} else {
		a.config = ConfigFromEnv()
	}
	logger.Enabled = a.config.TranslatorDebug

	googleTranslator := translator.New()

	var repo domain.Repository
	jsonRepo, err := history.New()
	if err != nil {
		logger.Debugf("warning: failed to init history repo: %v", err)
		repo = nopRepository{}
	} else {
		repo = jsonRepo
	}

	a.useCase = domain.NewUseCase(googleTranslator, repo, logger.DefaultLogger{})
	a.clipboard = clipboard.New(ctx)
	a.dictionary = dictionary.New()
	a.anki = anki.NewFromConfig(
		a.config.AnkiConnectURL,
		a.config.AnkiDeckWords,
		a.config.AnkiDeckPhrases,
		a.config.AnkiNoteTypeWords,
		a.config.AnkiNoteTypePhrases,
	)
	if a.config.ObsidianVaultPath != "" {
		if vault, err := obsidian.NewVault(a.config.ObsidianVaultPath); err != nil {
			logger.Debugf("warning: obsidian vault: %v", err)
		} else {
			a.obsidianVault = vault
		}
	}

	hotkeyService := hotkey.New(ctx, func(text string) {
		runtime.EventsEmit(ctx, "hotkey:paste", text)
	}, a.config.Hotkey)
	go hotkeyService.Start()

	logger.Debug("app: started successfully")
}

func (a *Application) Shutdown(_ context.Context) {
	logger.Debug("app: shutting down")
}

func (a *Application) Translate(req interfaces.TranslateRequestDTO) (*interfaces.TranslationDTO, error) {
	logger.Debugf("app: Translate called: text=%q from=%q to=%q", req.Text, req.FromLang, req.ToLang)

	langs := a.useCase.SupportedLanguages()

	cmd := domain.TranslateCommand{
		Text:     req.Text,
		FromLang: interfaces.ResolveLanguage(req.FromLang, langs),
		ToLang:   interfaces.ResolveLanguage(req.ToLang, langs),
	}

	result, err := a.useCase.Translate(cmd)
	if err != nil {
		logger.Debugf("app: Translate error: %v", err)
		return nil, err
	}

	dto := interfaces.MapTranslationToDTO(result)
	logger.Debugf("app: Translate success: %q -> %q", dto.Source, dto.Result)
	return &dto, nil
}

func (a *Application) GetHistory() ([]interfaces.TranslationDTO, error) {
	translations, err := a.useCase.GetHistory(domain.GetHistoryQuery{})
	if err != nil {
		return nil, err
	}
	return interfaces.MapTranslationsToDTO(translations), nil
}

func (a *Application) ClearHistory() error {
	return a.useCase.ClearHistory()
}

func (a *Application) GetClipboard() string {
	return a.clipboard.Read()
}

func (a *Application) GetLanguages() []interfaces.LanguageDTO {
	return interfaces.MapLanguagesToDTO(a.useCase.SupportedLanguages())
}

func (a *Application) ToggleAlwaysOnTop(enabled bool) {
	runtime.WindowSetAlwaysOnTop(a.ctx, enabled)
}

// LookupDictionary fetches transcription and examples for a word (e.g. for Anki/Obsidian). Returns nil if not found.
func (a *Application) LookupDictionary(word string, lang string) (*interfaces.DictionaryEntryDTO, error) {
	entry, err := a.dictionary.Lookup(word, lang)
	if err != nil || entry == nil {
		return nil, err
	}
	return &interfaces.DictionaryEntryDTO{
		Word:          entry.Word,
		Transcription: entry.Transcription,
		PartOfSpeech:  entry.PartOfSpeech,
		Definitions:   entry.Definitions,
		Examples:      entry.Examples,
	}, nil
}

// SaveToAnki creates an Anki note for the translation. For words, fetches dictionary data if not provided.
// Automatically generates native Anki tags and the display Tags field.
func (a *Application) SaveToAnki(req interfaces.SaveToAnkiRequestDTO) (*interfaces.SaveToAnkiResponseDTO, error) {
	logger.Debugf("app: SaveToAnki source=%q isPhrase=%v", req.Source, req.IsPhrase)
	source := strings.TrimSpace(req.Source)
	result := strings.TrimSpace(req.Result)
	if source == "" || result == "" {
		return &interfaces.SaveToAnkiResponseDTO{Error: "пустой текст или перевод"}, nil
	}
	transcription := req.Transcription
	partOfSpeech := req.PartOfSpeech
	exampleEN := req.ExampleEN
	exampleRU := req.ExampleRU
	definition := ""
	if !req.IsPhrase {
		entry, _ := a.dictionary.Lookup(source, req.FromLang)
		if entry != nil {
			if transcription == "" {
				transcription = entry.Transcription
			}
			if partOfSpeech == "" {
				partOfSpeech = entry.PartOfSpeech
			}
			if exampleEN == "" && len(entry.Examples) > 0 {
				limit := len(entry.Examples)
				if limit > 2 {
					limit = 2
				}
				exampleEN = strings.Join(entry.Examples[:limit], "<br>")
			}
			if len(entry.Definitions) > 0 {
				limit := len(entry.Definitions)
				if limit > 3 {
					limit = 3
				}
				definition = strings.Join(entry.Definitions[:limit], "<br>")
			}
		}
	}

	ankiTags, displayTags := buildAnkiTags(req.IsPhrase, partOfSpeech, req.FromLang, req.ToLang, req.Tags)

	if req.IsPhrase {
		noteID, err := a.anki.AddPhraseNote(source, result, exampleEN, exampleRU, req.Context, displayTags, ankiTags)
		if err != nil {
			logger.Debugf("app: SaveToAnki phrase error: %v", err)
			return &interfaces.SaveToAnkiResponseDTO{Error: err.Error()}, nil
		}
		logger.Debugf("app: SaveToAnki phrase noteId=%d tags=%v", noteID, ankiTags)
		return &interfaces.SaveToAnkiResponseDTO{NoteID: noteID}, nil
	}
	noteID, err := a.anki.AddWordNote(source, result, transcription, partOfSpeech, definition, exampleEN, exampleRU, req.Context, displayTags, "translator", ankiTags)
	if err != nil {
		logger.Debugf("app: SaveToAnki word error: %v", err)
		return &interfaces.SaveToAnkiResponseDTO{Error: err.Error()}, nil
	}
	logger.Debugf("app: SaveToAnki word noteId=%d tags=%v", noteID, ankiTags)
	return &interfaces.SaveToAnkiResponseDTO{NoteID: noteID}, nil
}

// buildAnkiTags generates native Anki tags and a display string for the Tags field.
func buildAnkiTags(isPhrase bool, partOfSpeech, fromLang, toLang, extraTags string) (ankiTags []string, display string) {
	ankiTags = []string{"translator"}

	if isPhrase {
		ankiTags = append(ankiTags, "phrase")
	} else {
		ankiTags = append(ankiTags, "word")
	}

	langPair := normalizeLangTag(fromLang) + "-" + normalizeLangTag(toLang)
	if langPair != "-" {
		ankiTags = append(ankiTags, langPair)
	}

	if !isPhrase && partOfSpeech != "" {
		pos := strings.ToLower(strings.TrimSpace(partOfSpeech))
		if pos != "" {
			ankiTags = append(ankiTags, pos)
		}
	}

	if extraTags != "" {
		for _, t := range strings.Fields(extraTags) {
			t = strings.TrimSpace(t)
			if t != "" {
				ankiTags = append(ankiTags, t)
			}
		}
	}

	parts := make([]string, len(ankiTags))
	for i, t := range ankiTags {
		parts[i] = "#" + t
	}
	display = strings.Join(parts, " ")
	return ankiTags, display
}

func normalizeLangTag(lang string) string {
	lang = strings.ToLower(strings.TrimSpace(lang))
	if lang == "auto" || lang == "" {
		return ""
	}
	return lang
}

// SaveToObsidian writes a note to the Obsidian vault (Vocabulary/Words or Phrases) and updates _index.md.
func (a *Application) SaveToObsidian(req interfaces.SaveToObsidianRequestDTO) (*interfaces.SaveToObsidianResponseDTO, error) {
	logger.Debugf("app: SaveToObsidian source=%q isPhrase=%v", req.Source, req.IsPhrase)
	if a.obsidianVault == nil {
		return &interfaces.SaveToObsidianResponseDTO{Error: "Obsidian не настроен: укажите путь к vault в настройках"}, nil
	}
	source := strings.TrimSpace(req.Source)
	result := strings.TrimSpace(req.Result)
	if source == "" || result == "" {
		return &interfaces.SaveToObsidianResponseDTO{Error: "пустой текст или перевод"}, nil
	}
	added := time.Now().Format("2006-01-02")
	tags := req.Tags
	if tags == "" {
		tags = "vocabulary"
	}
	if req.IsPhrase {
		path, err := a.obsidianVault.WritePhraseNote(obsidian.PhraseNoteParams{
			Phrase:      source,
			Translation: result,
			Examples:    []string{req.ExampleEN},
			ExamplesRU:  []string{req.ExampleRU},
			Context:     req.Context,
			Tags:        tags,
			Added:       added,
		})
		if err != nil {
			return &interfaces.SaveToObsidianResponseDTO{Error: err.Error()}, nil
		}
		if err := a.obsidianVault.AppendToIndex(source, result, "phrase", tags, added); err != nil {
			logger.Debugf("app: SaveToObsidian index error: %v", err)
		}
		return &interfaces.SaveToObsidianResponseDTO{Path: path}, nil
	}
	defs := []string{result}
	if req.PartOfSpeech != "" {
		defs = []string{result + " (" + req.PartOfSpeech + ")"}
	}
	path, err := a.obsidianVault.WriteWordNote(obsidian.WordNoteParams{
		Word:          source,
		Translation:   result,
		Transcription: req.Transcription,
		PartOfSpeech:  req.PartOfSpeech,
		Definitions:   defs,
		Examples:      []string{req.ExampleEN},
		ExamplesRU:    []string{req.ExampleRU},
		Context:       req.Context,
		Tags:          tags,
		Added:         added,
	})
	if err != nil {
		return &interfaces.SaveToObsidianResponseDTO{Error: err.Error()}, nil
	}
	partOfSpeech := req.PartOfSpeech
	if partOfSpeech == "" {
		partOfSpeech = "-"
	}
	if err := a.obsidianVault.AppendToIndex(source, result, partOfSpeech, tags, added); err != nil {
		logger.Debugf("app: SaveToObsidian index error: %v", err)
	}
	return &interfaces.SaveToObsidianResponseDTO{Path: path}, nil
}

// GetConfig returns the current app configuration for the settings UI.
func (a *Application) GetConfig() (*interfaces.ConfigDTO, error) {
	if a.config == nil {
		a.config = ConfigFromEnv()
	}
	return &interfaces.ConfigDTO{
		TranslatorDebug:     a.config.TranslatorDebug,
		ViteDebug:           a.config.ViteDebug,
		AnkiConnectURL:      a.config.AnkiConnectURL,
		AnkiDeckWords:       a.config.AnkiDeckWords,
		AnkiDeckPhrases:     a.config.AnkiDeckPhrases,
		AnkiNoteTypeWords:   a.config.AnkiNoteTypeWords,
		AnkiNoteTypePhrases: a.config.AnkiNoteTypePhrases,
		ObsidianVaultPath:   a.config.ObsidianVaultPath,
		Hotkey:              a.config.Hotkey,
	}, nil
}

// SaveConfig persists configuration and updates Anki/Obsidian and logger.
func (a *Application) SaveConfig(c interfaces.ConfigDTO) error {
	a.config = &Config{
		TranslatorDebug:     c.TranslatorDebug,
		ViteDebug:           c.ViteDebug,
		AnkiConnectURL:      c.AnkiConnectURL,
		AnkiDeckWords:       c.AnkiDeckWords,
		AnkiDeckPhrases:     c.AnkiDeckPhrases,
		AnkiNoteTypeWords:   c.AnkiNoteTypeWords,
		AnkiNoteTypePhrases: c.AnkiNoteTypePhrases,
		ObsidianVaultPath:   c.ObsidianVaultPath,
		Hotkey:              c.Hotkey,
	}
	logger.Enabled = a.config.TranslatorDebug
	if a.configPath != "" {
		if err := SaveConfig(a.configPath, a.config); err != nil {
			return err
		}
	}
	a.anki = anki.NewFromConfig(
		a.config.AnkiConnectURL,
		a.config.AnkiDeckWords,
		a.config.AnkiDeckPhrases,
		a.config.AnkiNoteTypeWords,
		a.config.AnkiNoteTypePhrases,
	)
	a.obsidianVault = nil
	if a.config.ObsidianVaultPath != "" {
		if vault, err := obsidian.NewVault(a.config.ObsidianVaultPath); err != nil {
			logger.Debugf("obsidian vault after config save: %v", err)
		} else {
			a.obsidianVault = vault
		}
	}
	return nil
}

type nopRepository struct{}

func (nopRepository) Save(_ domain.Translation) error        { return nil }
func (nopRepository) FindAll() ([]domain.Translation, error) { return nil, nil }
func (nopRepository) DeleteAll() error                       { return nil }
