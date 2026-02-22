// Package translation — use cases orchestrate domain logic.
// Dependencies flow inward: use cases depend only on domain interfaces.
package translation

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// UseCase orchestrates all translation-related operations.
// It depends on abstractions (interfaces), not concrete implementations (SRP, DIP).
type UseCase struct {
	translator Translator
	repo       Repository
}

// NewUseCase constructs a UseCase with injected dependencies.
func NewUseCase(translator Translator, repo Repository) *UseCase {
	return &UseCase{
		translator: translator,
		repo:       repo,
	}
}

// Translate performs translation and persists the result.
func (uc *UseCase) Translate(req TranslateRequest) (Translation, error) {
	if req.Text == "" {
		return Translation{}, fmt.Errorf("text cannot be empty")
	}

	result, err := uc.translator.Translate(req)
	if err != nil {
		return Translation{}, fmt.Errorf("translation failed: %w", err)
	}

	t := Translation{
		ID:        uuid.New().String(),
		Source:    req.Text,
		Result:    result,
		FromLang:  req.FromLang,
		ToLang:    req.ToLang,
		CreatedAt: time.Now(),
	}

	if err := uc.repo.Save(t); err != nil {
		// Non-fatal: translation succeeded, only persistence failed.
		fmt.Printf("warning: failed to save translation: %v\n", err)
	}

	return t, nil
}

// GetHistory returns all past translations ordered by recency.
func (uc *UseCase) GetHistory() ([]Translation, error) {
	return uc.repo.FindAll()
}

// ClearHistory removes all persisted translations.
func (uc *UseCase) ClearHistory() error {
	return uc.repo.DeleteAll()
}

// SupportedLanguages returns the list of available language options.
func (uc *UseCase) SupportedLanguages() []Language {
	return SupportedLanguages
}
