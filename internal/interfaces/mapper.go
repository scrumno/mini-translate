package interfaces

import (
	"time"
	domain "translator/internal/domain/translation"
)

func MapTranslationToDTO(t domain.Translation) TranslationDTO {
	return TranslationDTO{
		ID:        t.ID,
		Source:    t.Source,
		Result:    t.Result,
		FromLang:  t.FromLang.Code,
		ToLang:    t.ToLang.Code,
		CreatedAt: t.CreatedAt.Format(time.RFC3339),
	}
}

func MapTranslationsToDTO(translations []domain.Translation) []TranslationDTO {
	result := make([]TranslationDTO, len(translations))
	for i, t := range translations {
		result[i] = MapTranslationToDTO(t)
	}
	return result
}

func MapLanguagesToDTO(langs []domain.Language) []LanguageDTO {
	result := make([]LanguageDTO, len(langs))
	for i, l := range langs {
		result[i] = LanguageDTO{Code: l.Code, Name: l.Name}
	}
	return result
}

func ResolveLanguage(code string, available []domain.Language) domain.Language {
	for _, l := range available {
		if l.Code == code {
			return l
		}
	}
	return domain.Language{Code: "auto", Name: "Auto"}
}
