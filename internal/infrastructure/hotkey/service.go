// Package hotkey registers system-wide keyboard shortcuts.
package hotkey

import (
	"context"
	"strings"

	hook "github.com/robotn/gohook"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"translator/internal/pkg/logger"
)

// Handler is called when the hotkey fires, receiving clipboard text.
type Handler func(clipboardText string)

// Service manages global hotkey registration.
type Service struct {
	ctx     context.Context
	handler Handler
	keys    []string
}

// New constructs a hotkey Service with a configurable hotkey string (e.g. "ctrl+shift+t").
func New(ctx context.Context, handler Handler, hotkey string) *Service {
	keys := parseHotkey(hotkey)
	return &Service{ctx: ctx, handler: handler, keys: keys}
}

func parseHotkey(hotkey string) []string {
	parts := strings.Split(strings.ToLower(strings.TrimSpace(hotkey)), "+")
	var result []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			result = append(result, p)
		}
	}
	if len(result) == 0 {
		return []string{"ctrl", "shift", "t"}
	}
	return result
}

// Start begins listening for the configured global hotkey.
// Blocks until context is cancelled — run in a goroutine.
func (s *Service) Start() {
	hook.Register(hook.KeyDown, s.keys, func(e hook.Event) {
		text, err := runtime.ClipboardGetText(s.ctx)
		if err != nil || text == "" {
			return
		}

		runtime.WindowShow(s.ctx)
		s.handler(text)
	})

	logger.Debug("hotkey: listening for " + strings.Join(s.keys, "+"))
	s.run()
}

func (s *Service) run() {
	st := hook.Start()
	<-hook.Process(st)
}
