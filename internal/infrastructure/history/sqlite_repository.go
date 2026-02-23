package history

import (
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"time"

	_ "modernc.org/sqlite"

	domain "translator/internal/domain/translation"
)

const (
	maxSQLiteHistorySize = 500
	dbFileName           = "translator.db"
)

// SQLiteRepository persists translations to a SQLite database.
type SQLiteRepository struct {
	mu sync.RWMutex
	db *sql.DB
}

// NewSQLite creates a SQLiteRepository, running migrations and importing
// data from the legacy JSON file if present.
func NewSQLite() (*SQLiteRepository, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	dir := filepath.Join(home, ".translator")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(dir, dbFileName)
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS translations (
			id         TEXT PRIMARY KEY,
			source     TEXT NOT NULL,
			result     TEXT NOT NULL,
			from_lang  TEXT NOT NULL,
			to_lang    TEXT NOT NULL,
			created_at DATETIME NOT NULL
		)
	`); err != nil {
		db.Close()
		return nil, err
	}

	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_translations_created ON translations(created_at DESC)`); err != nil {
		db.Close()
		return nil, err
	}

	repo := &SQLiteRepository{db: db}

	jsonPath := filepath.Join(dir, "history.json")
	if _, statErr := os.Stat(jsonPath); statErr == nil {
		repo.migrateFromJSON(jsonPath)
	}

	return repo, nil
}

func (r *SQLiteRepository) migrateFromJSON(jsonPath string) {
	data, err := os.ReadFile(jsonPath)
	if err != nil {
		return
	}
	var entries []domain.Translation
	if err := json.Unmarshal(data, &entries); err != nil {
		return
	}
	if len(entries) == 0 {
		return
	}

	tx, err := r.db.Begin()
	if err != nil {
		return
	}
	stmt, err := tx.Prepare(`INSERT OR IGNORE INTO translations (id, source, result, from_lang, to_lang, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return
	}
	defer stmt.Close()

	for _, t := range entries {
		stmt.Exec(t.ID, t.Source, t.Result, t.FromLang.Code, t.ToLang.Code, t.CreatedAt)
	}
	if err := tx.Commit(); err != nil {
		return
	}

	os.Rename(jsonPath, jsonPath+".bak")
}

func (r *SQLiteRepository) Save(t domain.Translation) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.db.Exec(
		`INSERT INTO translations (id, source, result, from_lang, to_lang, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
		t.ID, t.Source, t.Result, t.FromLang.Code, t.ToLang.Code, t.CreatedAt,
	)
	if err != nil {
		return err
	}

	_, err = r.db.Exec(`
		DELETE FROM translations WHERE id NOT IN (
			SELECT id FROM translations ORDER BY created_at DESC LIMIT ?
		)
	`, maxSQLiteHistorySize)
	return err
}

func (r *SQLiteRepository) FindAll() ([]domain.Translation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	rows, err := r.db.Query(`SELECT id, source, result, from_lang, to_lang, created_at FROM translations ORDER BY created_at DESC LIMIT ?`, maxSQLiteHistorySize)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.Translation
	for rows.Next() {
		var t domain.Translation
		var fromCode, toCode string
		var createdAt time.Time
		if err := rows.Scan(&t.ID, &t.Source, &t.Result, &fromCode, &toCode, &createdAt); err != nil {
			continue
		}
		t.FromLang = domain.Language{Code: fromCode}
		t.ToLang = domain.Language{Code: toCode}
		t.CreatedAt = createdAt
		results = append(results, t)
	}
	return results, rows.Err()
}

func (r *SQLiteRepository) DeleteAll() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.db.Exec(`DELETE FROM translations`)
	return err
}
