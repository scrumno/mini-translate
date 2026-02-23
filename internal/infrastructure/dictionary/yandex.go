package dictionary

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const yandexBaseURL = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup"

// YandexClient calls the Yandex Dictionary API.
type YandexClient struct {
	apiKey     string
	httpClient *http.Client
}

// NewYandex creates a Yandex Dictionary client.
func NewYandex(apiKey string) *YandexClient {
	return &YandexClient{
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// Lookup fetches word data from Yandex Dictionary API.
func (c *YandexClient) Lookup(word string, lang string) (*Entry, error) {
	word = strings.TrimSpace(strings.ToLower(word))
	if word == "" || strings.Contains(word, " ") {
		return nil, nil
	}
	if c.apiKey == "" {
		return nil, fmt.Errorf("yandex dictionary: API key not set")
	}

	langPair := mapToYandexLang(lang)

	params := url.Values{
		"key":  {c.apiKey},
		"lang": {langPair},
		"text": {word},
	}

	resp, err := c.httpClient.Get(yandexBaseURL + "?" + params.Encode())
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("yandex dictionary: invalid API key")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("yandex dictionary: %s", resp.Status)
	}

	var raw yandexResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	if len(raw.Def) == 0 {
		return nil, nil
	}

	entry := &Entry{Word: word}
	firstDef := raw.Def[0]

	if firstDef.Ts != "" {
		entry.Transcription = "/" + firstDef.Ts + "/"
	}
	if firstDef.Pos != "" {
		entry.PartOfSpeech = firstDef.Pos
	}

	for _, def := range raw.Def {
		for _, tr := range def.Tr {
			if tr.Text != "" {
				entry.Definitions = append(entry.Definitions, tr.Text)
			}
			for _, ex := range tr.Ex {
				if ex.Text != "" {
					entry.Examples = append(entry.Examples, ex.Text)
				}
			}
		}
	}

	return entry, nil
}

func mapToYandexLang(lang string) string {
	switch lang {
	case "en":
		return "en-ru"
	case "ru":
		return "ru-en"
	case "de":
		return "de-ru"
	case "fr":
		return "fr-ru"
	case "es":
		return "es-ru"
	case "it":
		return "it-ru"
	case "tr":
		return "tr-ru"
	case "uk":
		return "uk-ru"
	case "pl":
		return "pl-ru"
	default:
		return lang + "-ru"
	}
}

type yandexResponse struct {
	Def []yandexDef `json:"def"`
}

type yandexDef struct {
	Text string     `json:"text"`
	Pos  string     `json:"pos"`
	Ts   string     `json:"ts"`
	Tr   []yandexTr `json:"tr"`
}

type yandexTr struct {
	Text string     `json:"text"`
	Ex   []yandexEx `json:"ex"`
}

type yandexEx struct {
	Text string `json:"text"`
}
