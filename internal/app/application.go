package app

import (
	"context"
	"log"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	domain "translator/internal/domain/translation"
	"translator/internal/infrastructure/clipboard"
	"translator/internal/infrastructure/history"
	"translator/internal/infrastructure/hotkey"
	"translator/internal/infrastructure/translator"
	"translator/internal/interfaces"
)

type Application struct {
	ctx       context.Context
	useCase   *domain.UseCase
	clipboard *clipboard.Service
}

func NewApplication() *Application {
	return &Application{}
}

func (a *Application) Startup(ctx context.Context) {
	a.ctx = ctx

	googleTranslator := translator.New()

	var repo domain.Repository
	jsonRepo, err := history.New()
	if err != nil {
		log.Printf("warning: failed to init history repo: %v", err)
		repo = nopRepository{}
	} else {
		repo = jsonRepo
	}

	a.useCase = domain.NewUseCase(googleTranslator, repo)
	a.clipboard = clipboard.New(ctx)

	hotkeyService := hotkey.New(ctx, func(text string) {
		runtime.EventsEmit(ctx, "hotkey:paste", text)
	})
	go hotkeyService.Start()

	log.Println("app: started successfully")
}

func (a *Application) Shutdown(_ context.Context) {
	log.Println("app: shutting down")
}

func (a *Application) Translate(req interfaces.TranslateRequestDTO) (*interfaces.TranslationDTO, error) {
	log.Printf("app: Translate called: text=%q from=%q to=%q", req.Text, req.FromLang, req.ToLang)

	langs := a.useCase.SupportedLanguages()

	domainReq := domain.TranslateRequest{
		Text:     req.Text,
		FromLang: interfaces.ResolveLanguage(req.FromLang, langs),
		ToLang:   interfaces.ResolveLanguage(req.ToLang, langs),
	}

	result, err := a.useCase.Translate(domainReq)
	if err != nil {
		log.Printf("app: Translate error: %v", err)
		return nil, err
	}

	dto := interfaces.MapTranslationToDTO(result)
	log.Printf("app: Translate success: %q -> %q", dto.Source, dto.Result)
	return &dto, nil
}

func (a *Application) GetHistory() ([]interfaces.TranslationDTO, error) {
	translations, err := a.useCase.GetHistory()
	if err != nil {
		return nil, err
	}
	return interfaces.MapTranslationsToDTO(translations), nil
}

func (a *Application) ClearHistory() error {
	return a.useCase.ClearHistory()
}

func (a *Application) GetClipboard() string {
	return a.clipboard.Read()
}

func (a *Application) GetLanguages() []interfaces.LanguageDTO {
	return interfaces.MapLanguagesToDTO(a.useCase.SupportedLanguages())
}

func (a *Application) ToggleAlwaysOnTop(enabled bool) {
	runtime.WindowSetAlwaysOnTop(a.ctx, enabled)
}

type nopRepository struct{}

func (nopRepository) Save(_ domain.Translation) error        { return nil }
func (nopRepository) FindAll() ([]domain.Translation, error) { return nil, nil }
func (nopRepository) DeleteAll() error                       { return nil }
