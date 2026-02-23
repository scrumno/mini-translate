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
	log        DebugLogger
}

// NewUseCase constructs a UseCase with injected dependencies.
// log may be nil to disable debug logging.
func NewUseCase(translator Translator, repo Repository, log DebugLogger) *UseCase {
	return &UseCase{
		translator: translator,
		repo:       repo,
		log:        log,
	}
}

// Translate performs translation and persists the result.
func (uc *UseCase) Translate(cmd TranslateCommand) (Translation, error) {
	if cmd.Text == "" {
		return Translation{}, fmt.Errorf("text cannot be empty")
	}

	result, err := uc.translator.Translate(cmd)
	if err != nil {
		return Translation{}, fmt.Errorf("translation failed: %w", err)
	}

	t := Translation{
		ID:        uuid.New().String(),
		Source:    cmd.Text,
		Result:    result,
		FromLang:  cmd.FromLang,
		ToLang:    cmd.ToLang,
		CreatedAt: time.Now(),
	}

	if err := uc.repo.Save(t); err != nil {
		// Non-fatal: translation succeeded, only persistence failed.
		if uc.log != nil {
			uc.log.Debugf("warning: failed to save translation: %v", err)
		}
	}

	return t, nil
}

// GetHistory returns all past translations ordered by recency.
func (uc *UseCase) GetHistory(_ GetHistoryQuery) ([]Translation, error) {
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
