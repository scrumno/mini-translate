package main

import (
	"embed"

	"github.com/joho/godotenv"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"translator/internal/app"
	"translator/internal/pkg/logger"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	_ = godotenv.Load()
	logger.InitFromEnv()

	application := app.NewApplication()

	err := wails.Run(&options.App{
		Title:            "Переводчик by scrumno",
		Width:            380,
		Height:           520,
		MinWidth:         320,
		MinHeight:        400,
		AlwaysOnTop:      true,
		Frameless:        true,
		BackgroundColour: &options.RGBA{R: 28, G: 28, B: 28, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup:  application.Startup,
		OnShutdown: application.Shutdown,
		Bind:       []interface{}{application},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    true,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHiddenInset(),
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
		},
		Linux: &linux.Options{
			WindowIsTranslucent: false,
		},
	})

	if err != nil {
		panic(err)
	}
}
