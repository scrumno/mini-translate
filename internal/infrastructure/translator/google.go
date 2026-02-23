package translator

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	domain "translator/internal/domain/translation"
	"translator/internal/pkg/logger"
)

type GoogleTranslator struct {
	client *http.Client
}

func New() *GoogleTranslator {
	return &GoogleTranslator{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

// Translate splits text by newlines, translates each non-empty line,
// and reassembles preserving the original structure.
func (g *GoogleTranslator) Translate(req domain.TranslateCommand) (string, error) {
	lines := strings.Split(req.Text, "\n")
	results := make([]string, len(lines))

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			results[i] = ""
			continue
		}

		translated, err := g.translateLine(trimmed, req.FromLang.Code, req.ToLang.Code)
		if err != nil {
			return "", err
		}
		results[i] = translated
	}

	return strings.Join(results, "\n"), nil
}

func (g *GoogleTranslator) translateLine(text, from, to string) (string, error) {
	endpoint := fmt.Sprintf(
		"https://translate.googleapis.com/translate_a/single?client=gtx&sl=%s&tl=%s&dt=t&q=%s",
		from, to, url.QueryEscape(text),
	)

	logger.Debugf("translator: GET %s", endpoint)

	resp, err := g.client.Get(endpoint)
	if err != nil {
		return "", fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	return parseResponse(body)
}

func parseResponse(body []byte) (string, error) {
	var raw []interface{}
	if err := json.Unmarshal(body, &raw); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if len(raw) == 0 {
		return "", fmt.Errorf("empty response")
	}

	sentences, ok := raw[0].([]interface{})
	if !ok {
		return "", fmt.Errorf("unexpected response format")
	}

	var sb strings.Builder
	for _, item := range sentences {
		pair, ok := item.([]interface{})
		if !ok || len(pair) == 0 {
			continue
		}
		if s, ok := pair[0].(string); ok {
			sb.WriteString(s)
		}
	}

	result := sb.String()
	if result == "" {
		return "", fmt.Errorf("empty translation result")
	}

	return result, nil
}
