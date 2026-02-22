// Package translation contains the core domain model.
// This layer has ZERO external dependencies — pure business logic.
package translation

import "time"

// ─── Entities ────────────────────────────────────────────────────────────────

// Translation is the core aggregate root.
type Translation struct {
	ID        string
	Source    string
	Result    string
	FromLang  Language
	ToLang    Language
	CreatedAt time.Time
}

// Language represents a supported language code.
type Language struct {
	Code string
	Name string
}

// ─── Value Objects ────────────────────────────────────────────────────────────

// TranslateRequest is an immutable value object describing a translation request.
type TranslateRequest struct {
	Text     string
	FromLang Language
	ToLang   Language
}

// ─── Repository Interface (DIP) ───────────────────────────────────────────────

// Repository defines persistence operations for translations.
// Implemented in infrastructure layer.
type Repository interface {
	Save(t Translation) error
	FindAll() ([]Translation, error)
	DeleteAll() error
}

// ─── Service Interface (DIP) ──────────────────────────────────────────────────

// Translator defines the translation capability.
// Implemented in infrastructure layer.
type Translator interface {
	Translate(req TranslateRequest) (string, error)
}

// ─── Supported Languages ──────────────────────────────────────────────────────

var SupportedLanguages = []Language{
	{Code: "auto", Name: "Auto"},
	{Code: "en", Name: "English"},
	{Code: "ru", Name: "Russian"},
	{Code: "de", Name: "German"},
	{Code: "fr", Name: "French"},
	{Code: "es", Name: "Spanish"},
	{Code: "zh", Name: "Chinese"},
	{Code: "ja", Name: "Japanese"},
	{Code: "ko", Name: "Korean"},
	{Code: "ar", Name: "Arabic"},
	{Code: "pt", Name: "Portuguese"},
	{Code: "it", Name: "Italian"},
	{Code: "pl", Name: "Polish"},
	{Code: "tr", Name: "Turkish"},
	{Code: "uk", Name: "Ukrainian"},
}
