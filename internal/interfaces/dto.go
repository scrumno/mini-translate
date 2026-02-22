package interfaces

// TranslationDTO is the data transfer object returned to the frontend.
type TranslationDTO struct {
	ID        string `json:"id"`
	Source    string `json:"source"`
	Result    string `json:"result"`
	FromLang  string `json:"fromLang"`
	ToLang    string `json:"toLang"`
	CreatedAt string `json:"createdAt"`
}

// TranslateRequestDTO is the data transfer object received from the frontend.
type TranslateRequestDTO struct {
	Text     string `json:"text"`
	FromLang string `json:"fromLang"`
	ToLang   string `json:"toLang"`
}

// LanguageDTO is the data transfer object for language options.
type LanguageDTO struct {
	Code string `json:"code"`
	Name string `json:"name"`
}
