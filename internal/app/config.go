package app

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

const (
	configDir  = "translator-scrumno"
	configFile = "config.json"
)

type Config struct {
	TranslatorDebug     bool   `json:"translatorDebug"`
	ViteDebug           bool   `json:"viteDebug"`
	AnkiConnectURL      string `json:"ankiConnectUrl"`
	AnkiDeckWords       string `json:"ankiDeckWords"`
	AnkiDeckPhrases     string `json:"ankiDeckPhrases"`
	AnkiNoteTypeWords   string `json:"ankiNoteTypeWords"`
	AnkiNoteTypePhrases string `json:"ankiNoteTypePhrases"`
	AutoAddToAnki       bool   `json:"autoAddToAnki"`
	AnkiAutoSync        bool   `json:"ankiAutoSync"`
	CompactMode             bool   `json:"compactMode"`
	DictionaryProvider      string `json:"dictionaryProvider"`
	YandexDictionaryAPIKey  string `json:"yandexDictionaryApiKey"`
	Hotkey                  string `json:"hotkey"`
	HotkeyAddToAnki         string `json:"hotkeyAddToAnki"`
}

// ConfigPath returns the path to the config file (in user config dir).
func ConfigPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, configDir, configFile), nil
}

// LoadConfig reads config from the given path. If file does not exist or is invalid, returns config filled from env.
func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return ConfigFromEnv(), nil
		}
		return nil, err
	}
	var c Config
	if err := json.Unmarshal(data, &c); err != nil {
		return ConfigFromEnv(), nil
	}
	// Merge with env: env overrides empty fields
	fromEnv := ConfigFromEnv()
	if c.AnkiConnectURL == "" {
		c.AnkiConnectURL = fromEnv.AnkiConnectURL
	}
	if c.AnkiDeckWords == "" {
		c.AnkiDeckWords = fromEnv.AnkiDeckWords
	}
	if c.AnkiDeckPhrases == "" {
		c.AnkiDeckPhrases = fromEnv.AnkiDeckPhrases
	}
	if c.AnkiNoteTypeWords == "" {
		c.AnkiNoteTypeWords = fromEnv.AnkiNoteTypeWords
	}
	if c.AnkiNoteTypePhrases == "" {
		c.AnkiNoteTypePhrases = fromEnv.AnkiNoteTypePhrases
	}
	if c.Hotkey == "" {
		c.Hotkey = fromEnv.Hotkey
	}
	if c.HotkeyAddToAnki == "" {
		c.HotkeyAddToAnki = fromEnv.HotkeyAddToAnki
	}
	return &c, nil
}

// ConfigFromEnv builds Config from environment variables (and .env).
func ConfigFromEnv() *Config {
	c := &Config{}
	// Debug: TRANSLATOR_DEBUG, VITE_DEBUG
	v := strings.TrimSpace(strings.ToLower(os.Getenv("TRANSLATOR_DEBUG")))
	c.TranslatorDebug = v == "true" || v == "1"
	v = strings.TrimSpace(strings.ToLower(os.Getenv("VITE_DEBUG")))
	c.ViteDebug = v == "true" || v == "1"
	// Anki
	c.AnkiConnectURL = os.Getenv("ANKI_CONNECT_URL")
	if c.AnkiConnectURL == "" {
		c.AnkiConnectURL = "http://127.0.0.1:8765"
	}
	c.AnkiDeckWords = os.Getenv("ANKI_DECK_WORDS")
	if c.AnkiDeckWords == "" {
		c.AnkiDeckWords = "English/Words/Default"
	}
	c.AnkiDeckPhrases = os.Getenv("ANKI_DECK_PHRASES")
	if c.AnkiDeckPhrases == "" {
		c.AnkiDeckPhrases = "English/Phrases"
	}
	c.AnkiNoteTypeWords = os.Getenv("ANKI_NOTE_TYPE_WORDS")
	if c.AnkiNoteTypeWords == "" {
		c.AnkiNoteTypeWords = "TranslatorWord"
	}
	c.AnkiNoteTypePhrases = os.Getenv("ANKI_NOTE_TYPE_PHRASES")
	if c.AnkiNoteTypePhrases == "" {
		c.AnkiNoteTypePhrases = "TranslatorPhrase"
	}
	// Hotkeys
	c.Hotkey = strings.TrimSpace(os.Getenv("TRANSLATOR_HOTKEY"))
	if c.Hotkey == "" {
		c.Hotkey = "ctrl+shift+t"
	}
	c.HotkeyAddToAnki = strings.TrimSpace(os.Getenv("TRANSLATOR_HOTKEY_ANKI"))
	if c.HotkeyAddToAnki == "" {
		c.HotkeyAddToAnki = "ctrl+shift+a"
	}
	return c
}

// SaveConfig writes config to the given path (creates dir if needed).
func SaveConfig(path string, c *Config) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0750); err != nil {
		return err
	}
	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0600)
}
