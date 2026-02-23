package obsidian

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

const (
	vocabDir   = "Vocabulary"
	wordsDir   = "Vocabulary/Words"
	phrasesDir = "Vocabulary/Phrases"
	indexFile  = "Vocabulary/_index.md"
)

// Vault writes notes to an Obsidian vault directory.
type Vault struct {
	root string
}

// ConfigFromEnv returns the vault path from OBSIDIAN_VAULT_PATH.
func ConfigFromEnv() string {
	return os.Getenv("OBSIDIAN_VAULT_PATH")
}

// NewVault creates a vault writer. root is the vault root path.
func NewVault(root string) (*Vault, error) {
	root = strings.TrimSpace(root)
	if root == "" {
		return nil, fmt.Errorf("OBSIDIAN_VAULT_PATH is not set")
	}
	info, err := os.Stat(root)
	if err != nil {
		return nil, fmt.Errorf("vault path: %w", err)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("vault path is not a directory")
	}
	return &Vault{root: root}, nil
}

// safeFilename returns a filename-safe string for the note (e.g. "to pull someone's leg" -> "to pull someones leg" or similar).
func safeFilename(s string) string {
	s = strings.TrimSpace(s)
	s = regexp.MustCompile(`[<>:"/\\|?*]`).ReplaceAllString(s, "")
	s = strings.ReplaceAll(s, "'", "")
	if s == "" {
		s = "untitled"
	}
	return s + ".md"
}

// WordNoteParams holds data for a word note.
type WordNoteParams struct {
	Word          string
	Translation   string
	Transcription string
	PartOfSpeech  string
	Definitions   []string
	Examples      []string // EN examples
	ExamplesRU    []string // RU translations of examples (optional)
	Context       string
	Tags          string
	Added         string
}

// PhraseNoteParams holds data for a phrase note.
type PhraseNoteParams struct {
	Phrase      string
	Translation string
	Examples    []string
	ExamplesRU  []string
	Context     string
	Tags        string
	Added       string
}

// WriteWordNote creates Vocabulary/Words/{word}.md.
func (v *Vault) WriteWordNote(p WordNoteParams) (string, error) {
	dir := filepath.Join(v.root, wordsDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	fpath := filepath.Join(dir, safeFilename(p.Word))
	added := p.Added
	if added == "" {
		added = time.Now().Format("2006-01-02")
	}
	tags := p.Tags
	if tags == "" {
		tags = "vocabulary"
	}
	body := buildWordNoteBody(p, added, tags)
	if err := os.WriteFile(fpath, []byte(body), 0644); err != nil {
		return "", err
	}
	return fpath, nil
}

// WritePhraseNote creates Vocabulary/Phrases/{phrase}.md.
func (v *Vault) WritePhraseNote(p PhraseNoteParams) (string, error) {
	dir := filepath.Join(v.root, phrasesDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	fpath := filepath.Join(dir, safeFilename(p.Phrase))
	added := p.Added
	if added == "" {
		added = time.Now().Format("2006-01-02")
	}
	tags := p.Tags
	if tags == "" {
		tags = "vocabulary"
	}
	body := buildPhraseNoteBody(p, added, tags)
	if err := os.WriteFile(fpath, []byte(body), 0644); err != nil {
		return "", err
	}
	return fpath, nil
}

// AppendToIndex appends a row to Vocabulary/_index.md (word or phrase).
func (v *Vault) AppendToIndex(wordOrPhrase, translation, partOfSpeech, tags, added string) error {
	dir := filepath.Join(v.root, vocabDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	indexPath := filepath.Join(v.root, indexFile)
	row := fmt.Sprintf("| [[%s]] | %s | %s | %s | %s |\n", wordOrPhrase, translation, partOfSpeech, tags, added)
	var content []byte
	exist, _ := os.Stat(indexPath)
	if exist == nil {
		content, _ = os.ReadFile(indexPath)
	}
	if len(content) == 0 {
		content = []byte("# Vocabulary Index\n\n| Слово | Перевод | Часть речи | Тег | Дата |\n|-------|---------|------------|-----|------|\n")
	}
	content = append(content, []byte(row)...)
	return os.WriteFile(indexPath, content, 0644)
}

func buildWordNoteBody(p WordNoteParams, added, tags string) string {
	var b strings.Builder
	b.WriteString("---\n")
	b.WriteString(fmt.Sprintf("word: %s\n", p.Word))
	b.WriteString(fmt.Sprintf("translation: %s\n", p.Translation))
	if p.Transcription != "" {
		b.WriteString(fmt.Sprintf("transcription: %s\n", p.Transcription))
	}
	if p.PartOfSpeech != "" {
		b.WriteString(fmt.Sprintf("part_of_speech: %s\n", p.PartOfSpeech))
	}
	b.WriteString(fmt.Sprintf("tags: [%s]\n", tags))
	b.WriteString(fmt.Sprintf("added: %s\n", added))
	b.WriteString("anki_added: false\n")
	b.WriteString("---\n\n")
	b.WriteString(fmt.Sprintf("# %s", p.Word))
	if p.Transcription != "" {
		b.WriteString(fmt.Sprintf(" %s", p.Transcription))
	}
	b.WriteString("\n\n")
	b.WriteString(fmt.Sprintf("**%s**", p.Translation))
	if p.PartOfSpeech != "" {
		b.WriteString(fmt.Sprintf(" · %s", p.PartOfSpeech))
	}
	b.WriteString("\n\n")
	if len(p.Definitions) > 0 {
		b.WriteString("## Значения\n")
		for i, d := range p.Definitions {
			b.WriteString(fmt.Sprintf("%d. %s\n", i+1, d))
		}
		b.WriteString("\n")
	}
	if len(p.Examples) > 0 {
		b.WriteString("## Примеры\n")
		for i, ex := range p.Examples {
			b.WriteString(fmt.Sprintf("- *%s*", ex))
			if i < len(p.ExamplesRU) && p.ExamplesRU[i] != "" {
				b.WriteString(fmt.Sprintf(" — %s", p.ExamplesRU[i]))
			}
			b.WriteString("\n")
		}
		b.WriteString("\n")
	}
	if p.Context != "" {
		b.WriteString("## Мой контекст\n")
		b.WriteString(fmt.Sprintf("> %s\n\n", p.Context))
	}
	b.WriteString("## Заметки\n")
	b.WriteString("_\n")
	return b.String()
}

func buildPhraseNoteBody(p PhraseNoteParams, added, tags string) string {
	var b strings.Builder
	b.WriteString("---\n")
	b.WriteString(fmt.Sprintf("phrase: %s\n", p.Phrase))
	b.WriteString(fmt.Sprintf("translation: %s\n", p.Translation))
	b.WriteString("type: idiom\n")
	b.WriteString(fmt.Sprintf("tags: [%s]\n", tags))
	b.WriteString(fmt.Sprintf("added: %s\n", added))
	b.WriteString("---\n\n")
	b.WriteString(fmt.Sprintf("# %s\n\n", p.Phrase))
	b.WriteString(fmt.Sprintf("**%s**\n\n", p.Translation))
	if len(p.Examples) > 0 {
		b.WriteString("## Примеры\n")
		for i, ex := range p.Examples {
			b.WriteString(fmt.Sprintf("- *%s*", ex))
			if i < len(p.ExamplesRU) && p.ExamplesRU[i] != "" {
				b.WriteString(fmt.Sprintf(" — %s", p.ExamplesRU[i]))
			}
			b.WriteString("\n")
		}
		b.WriteString("\n")
	}
	if p.Context != "" {
		b.WriteString("## Мой контекст\n")
		b.WriteString(fmt.Sprintf("> %s\n\n", p.Context))
	}
	b.WriteString("## Заметки\n")
	b.WriteString("_\n")
	return b.String()
}
