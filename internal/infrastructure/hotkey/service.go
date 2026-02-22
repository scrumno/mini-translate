// Package hotkey registers system-wide keyboard shortcuts.
package hotkey

import (
	"context"
	"log"

	hook "github.com/robotn/gohook"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Handler is called when the hotkey fires, receiving clipboard text.
type Handler func(clipboardText string)

// Service manages global hotkey registration.
type Service struct {
	ctx     context.Context
	handler Handler
}

// New constructs a hotkey Service.
func New(ctx context.Context, handler Handler) *Service {
	return &Service{ctx: ctx, handler: handler}
}

// Start begins listening for global hotkeys (Ctrl+Shift+T).
// Blocks until context is cancelled — run in a goroutine.
func (s *Service) Start() {
	hook.Register(hook.KeyDown, []string{"ctrl", "shift", "t"}, func(e hook.Event) {
		text, err := runtime.ClipboardGetText(s.ctx)
		if err != nil || text == "" {
			return
		}

		runtime.WindowShow(s.ctx)
		s.handler(text)
	})

	log.Println("hotkey: listening for Ctrl+Shift+T")
	s.run()
}

func (s *Service) run() {
	st := hook.Start()
	<-hook.Process(st)
}
