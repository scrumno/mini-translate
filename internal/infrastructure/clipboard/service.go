// Package clipboard provides clipboard read access via the Wails runtime.
package clipboard

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Service reads from the system clipboard using the Wails runtime context.
type Service struct {
	ctx context.Context
}

// New constructs a clipboard Service.
func New(ctx context.Context) *Service {
	return &Service{ctx: ctx}
}

// Read returns the current clipboard text content.
func (s *Service) Read() string {
	text, err := runtime.ClipboardGetText(s.ctx)
	if err != nil {
		return ""
	}
	return text
}
