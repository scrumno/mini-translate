package dictionary

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const baseURL = "https://api.dictionaryapi.dev/api/v2/entries"

// Entry holds simplified dictionary data for a word.
type Entry struct {
	Word          string
	Transcription string
	PartOfSpeech  string
	Definitions   []string
	Examples      []string
}

// Looker is the interface for dictionary lookup.
type Looker interface {
	Lookup(word string, lang string) (*Entry, error)
}

// Client calls the Free Dictionary API.
type Client struct {
	httpClient *http.Client
}

// New creates a Free Dictionary client.
func New() *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// NewMulti creates a Looker based on provider config.
// provider: "free", "yandex", "yandex+free"
func NewMulti(provider, yandexKey string) Looker {
	switch provider {
	case "yandex":
		return NewYandex(yandexKey)
	case "yandex+free":
		return &fallbackLooker{
			primary:  NewYandex(yandexKey),
			fallback: New(),
		}
	default:
		return New()
	}
}

type fallbackLooker struct {
	primary  Looker
	fallback Looker
}

func (f *fallbackLooker) Lookup(word string, lang string) (*Entry, error) {
	entry, err := f.primary.Lookup(word, lang)
	if entry != nil {
		return entry, nil
	}
	if err != nil || entry == nil {
		return f.fallback.Lookup(word, lang)
	}
	return nil, nil
}

// Lookup fetches word data. Returns nil, nil if word not found (404) or not a single word.
func (c *Client) Lookup(word string, lang string) (*Entry, error) {
	word = strings.TrimSpace(strings.ToLower(word))
	if word == "" || strings.Contains(word, " ") {
		return nil, nil
	}
	// API supports en, es, fr, hi, etc.
	if lang == "auto" {
		lang = "en"
	}
	// Map our codes to API: ru -> not supported by free API, use "en" for source English
	langCode := mapLangToAPI(lang)

	path := fmt.Sprintf("%s/%s/%s", baseURL, langCode, url.PathEscape(word))
	req, err := http.NewRequest(http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("dictionary API: %s", resp.Status)
	}

	var raw []struct {
		Word     string `json:"word"`
		Phonetic string `json:"phonetic"`
		Phonetics []struct {
			Text string `json:"text"`
		} `json:"phonetics"`
		Meanings []struct {
			PartOfSpeech string `json:"partOfSpeech"`
			Definitions   []struct {
				Definition string `json:"definition"`
				Example    string `json:"example"`
			} `json:"definitions"`
		} `json:"meanings"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}
	if len(raw) == 0 {
		return nil, nil
	}
	first := raw[0]
	entry := &Entry{
		Word: first.Word,
	}
	if first.Phonetic != "" {
		entry.Transcription = first.Phonetic
	} else if len(first.Phonetics) > 0 && first.Phonetics[0].Text != "" {
		entry.Transcription = first.Phonetics[0].Text
	}
	var defs []string
	var examples []string
	for _, m := range first.Meanings {
		if entry.PartOfSpeech == "" {
			entry.PartOfSpeech = m.PartOfSpeech
		}
		for _, d := range m.Definitions {
			if d.Definition != "" {
				defs = append(defs, d.Definition)
			}
			if d.Example != "" {
				examples = append(examples, d.Example)
			}
		}
	}
	entry.Definitions = defs
	entry.Examples = examples
	return entry, nil
}

func mapLangToAPI(lang string) string {
	switch lang {
	case "en":
		return "en"
	case "es":
		return "es"
	case "fr":
		return "fr"
	case "hi":
		return "hi"
	case "de":
		return "de"
	case "it":
		return "it"
	case "ja":
		return "ja"
	case "ko":
		return "ko"
	case "ru", "uk", "pl", "tr", "ar", "zh", "pt":
		// API has limited languages; default to en for lookup of English words
		return "en"
	default:
		return "en"
	}
}
