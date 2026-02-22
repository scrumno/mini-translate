// Package history implements domain.Repository using a local JSON file.
package history

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	domain "translator/internal/domain/translation"
)

const maxHistorySize = 100

// JSONRepository persists translations to a JSON file in the user's home directory.
// Thread-safe via mutex.
type JSONRepository struct {
	mu       sync.RWMutex
	filePath string
}

// New constructs a JSONRepository, ensuring the storage file exists.
func New() (*JSONRepository, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	dir := filepath.Join(home, ".translator")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	return &JSONRepository{
		filePath: filepath.Join(dir, "history.json"),
	}, nil
}

// Save implements domain.Repository.
// Prepends the new entry and trims to maxHistorySize.
func (r *JSONRepository) Save(t domain.Translation) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	entries, err := r.readAll()
	if err != nil {
		entries = []domain.Translation{}
	}

	// Prepend: newest first
	entries = append([]domain.Translation{t}, entries...)
	if len(entries) > maxHistorySize {
		entries = entries[:maxHistorySize]
	}

	return r.writeAll(entries)
}

// FindAll implements domain.Repository.
func (r *JSONRepository) FindAll() ([]domain.Translation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.readAll()
}

// DeleteAll implements domain.Repository.
func (r *JSONRepository) DeleteAll() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	return r.writeAll([]domain.Translation{})
}

func (r *JSONRepository) readAll() ([]domain.Translation, error) {
	data, err := os.ReadFile(r.filePath)
	if os.IsNotExist(err) {
		return []domain.Translation{}, nil
	}
	if err != nil {
		return nil, err
	}

	var entries []domain.Translation
	if err := json.Unmarshal(data, &entries); err != nil {
		return []domain.Translation{}, nil
	}

	return entries, nil
}

func (r *JSONRepository) writeAll(entries []domain.Translation) error {
	data, err := json.MarshalIndent(entries, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(r.filePath, data, 0644)
}
