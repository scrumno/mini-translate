package anki

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

const defaultURL = "http://127.0.0.1:8765"

// Client calls AnkiConnect API.
type Client struct {
	baseURL    string
	deckWords  string
	deckPhrases string
	modelWords string
	modelPhrases string
	httpClient *http.Client
}

// Config from env.
func ConfigFromEnv() (baseURL, deckWords, deckPhrases, modelWords, modelPhrases string) {
	baseURL = os.Getenv("ANKI_CONNECT_URL")
	if baseURL == "" {
		baseURL = defaultURL
	}
	deckWords = os.Getenv("ANKI_DECK_WORDS")
	if deckWords == "" {
		deckWords = "English/Words/Default"
	}
	deckPhrases = os.Getenv("ANKI_DECK_PHRASES")
	if deckPhrases == "" {
		deckPhrases = "English/Phrases"
	}
	modelWords = os.Getenv("ANKI_NOTE_TYPE_WORDS")
	if modelWords == "" {
		modelWords = "TranslatorWord"
	}
	modelPhrases = os.Getenv("ANKI_NOTE_TYPE_PHRASES")
	if modelPhrases == "" {
		modelPhrases = "TranslatorPhrase"
	}
	return baseURL, deckWords, deckPhrases, modelWords, modelPhrases
}

// New creates an Anki client with config from env.
func New() *Client {
	baseURL, deckWords, deckPhrases, modelWords, modelPhrases := ConfigFromEnv()
	return NewFromConfig(baseURL, deckWords, deckPhrases, modelWords, modelPhrases)
}

// NewFromConfig creates an Anki client with the given config.
func NewFromConfig(baseURL, deckWords, deckPhrases, modelWords, modelPhrases string) *Client {
	if baseURL == "" {
		baseURL = defaultURL
	}
	return &Client{
		baseURL:      baseURL,
		deckWords:    deckWords,
		deckPhrases:  deckPhrases,
		modelWords:   modelWords,
		modelPhrases: modelPhrases,
		httpClient:   &http.Client{Timeout: 10 * time.Second},
	}
}

// addNoteRequest is the JSON-RPC request for AnkiConnect.
type addNoteRequest struct {
	Action  string `json:"action"`
	Version int    `json:"version"`
	Params  struct {
		Note addNoteParams `json:"note"`
	} `json:"params"`
}

type addNoteParams struct {
	DeckName  string            `json:"deckName"`
	ModelName string            `json:"modelName"`
	Fields    map[string]string `json:"fields"`
	Options   struct {
		AllowDuplicate bool `json:"allowDuplicate"`
	} `json:"options"`
	Tags []string `json:"tags"`
}

type ankiResponse struct {
	Result interface{} `json:"result"`
	Error  interface{} `json:"error"`
}

// AddWordNote creates a note with model TranslatorWord.
// ankiTags are native Anki tags used for filtering/browsing in Anki.
func (c *Client) AddWordNote(word, translation, transcription, partOfSpeech, definition, exampleEN, exampleRU, context, tags, source string, ankiTags []string) (int64, error) {
	added := time.Now().Format("2006-01-02")
	fields := map[string]string{
		"Word":          word,
		"Translation":   translation,
		"Transcription": transcription,
		"PartOfSpeech":  partOfSpeech,
		"Definition":    definition,
		"Example_EN":    exampleEN,
		"Example_RU":    exampleRU,
		"Context":       context,
		"Tags":          tags,
		"Source":        source,
		"Added":         added,
	}
	return c.addNote(c.deckWords, c.modelWords, fields, ankiTags)
}

// AddPhraseNote creates a note with model TranslatorPhrase (fields: Phrase, Translation, Example_EN, Example_RU, Context, Tags, Added).
// ankiTags are native Anki tags used for filtering/browsing in Anki.
func (c *Client) AddPhraseNote(phrase, translation, exampleEN, exampleRU, context, tags string, ankiTags []string) (int64, error) {
	added := time.Now().Format("2006-01-02")
	fields := map[string]string{
		"Phrase":      phrase,
		"Translation": translation,
		"Example_EN":  exampleEN,
		"Example_RU":  exampleRU,
		"Context":     context,
		"Tags":        tags,
		"Added":       added,
	}
	return c.addNote(c.deckPhrases, c.modelPhrases, fields, ankiTags)
}

func (c *Client) addNote(deckName, modelName string, fields map[string]string, tags []string) (int64, error) {
	if tags == nil {
		tags = []string{}
	}
	reqBody := addNoteRequest{
		Action:  "addNote",
		Version: 6,
	}
	reqBody.Params.Note.DeckName = deckName
	reqBody.Params.Note.ModelName = modelName
	reqBody.Params.Note.Fields = fields
	reqBody.Params.Note.Options.AllowDuplicate = false
	reqBody.Params.Note.Tags = tags

	body, err := json.Marshal(reqBody)
	if err != nil {
		return 0, err
	}
	resp, err := c.httpClient.Post(c.baseURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return 0, fmt.Errorf("anki connect: %w", err)
	}
	defer resp.Body.Close()
	var out ankiResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return 0, err
	}
	if out.Error != nil {
		return 0, fmt.Errorf("anki: %v", out.Error)
	}
	switch v := out.Result.(type) {
	case float64:
		return int64(v), nil
	case int64:
		return v, nil
	case int:
		return int64(v), nil
	default:
		return 0, fmt.Errorf("anki: unexpected result type %T", out.Result)
	}
}

// Sync triggers synchronization with AnkiWeb.
func (c *Client) Sync() error {
	body, err := json.Marshal(map[string]interface{}{
		"action":  "sync",
		"version": 6,
	})
	if err != nil {
		return err
	}
	resp, err := c.httpClient.Post(c.baseURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("anki sync: %w", err)
	}
	defer resp.Body.Close()
	var out ankiResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return err
	}
	if out.Error != nil {
		return fmt.Errorf("anki sync: %v", out.Error)
	}
	return nil
}

// IsPhrase returns true if text looks like a phrase (multiple words or contains spaces).
func IsPhrase(text string) bool {
	return strings.TrimSpace(text) == "" || strings.Contains(strings.TrimSpace(text), " ")
}
