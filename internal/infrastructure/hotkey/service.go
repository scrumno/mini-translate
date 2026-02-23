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

type hotkeyBinding struct {
	keys    []string
	handler Handler
}

// Service manages global hotkey registration.
type Service struct {
	ctx      context.Context
	bindings []hotkeyBinding
}

// New constructs a hotkey Service with the primary paste hotkey.
func New(ctx context.Context, handler Handler, hotkey string) *Service {
	s := &Service{ctx: ctx}
	s.Register(hotkey, handler)
	return s
}

// Register adds a new hotkey binding.
func (s *Service) Register(hotkey string, handler Handler) {
	keys := parseHotkey(hotkey)
	s.bindings = append(s.bindings, hotkeyBinding{keys: keys, handler: handler})
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

// Start begins listening for all registered global hotkeys.
// Blocks until context is cancelled — run in a goroutine.
func (s *Service) Start() {
	for _, b := range s.bindings {
		binding := b
		hook.Register(hook.KeyDown, binding.keys, func(e hook.Event) {
			text, err := runtime.ClipboardGetText(s.ctx)
			if err != nil || text == "" {
				return
			}
			runtime.WindowShow(s.ctx)
			binding.handler(text)
		})
		logger.Debug("hotkey: listening for " + strings.Join(binding.keys, "+"))
	}

	st := hook.Start()
	<-hook.Process(st)
}
