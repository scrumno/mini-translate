// Package logger provides centralized debug logging.
// Control via .env: TRANSLATOR_DEBUG=true|1 to enable, or call InitFromEnv() after loading .env.
package logger

import (
	"log"
	"os"
	"strings"
)

// Enabled controls all debug output. Set via InitFromEnv() or manually.
var Enabled = false

// InitFromEnv sets Enabled from TRANSLATOR_DEBUG env (true, 1 = enable; anything else = disable).
// Call after godotenv.Load() in main.
func InitFromEnv() {
	v := strings.TrimSpace(strings.ToLower(os.Getenv("TRANSLATOR_DEBUG")))
	Enabled = v == "true" || v == "1"
}

// Debugf logs when Enabled is true.
func Debugf(format string, args ...interface{}) {
	if Enabled {
		log.Printf(format, args...)
	}
}

// Debug logs a single message when Enabled is true.
func Debug(args ...interface{}) {
	if Enabled {
		log.Print(args...)
	}
}

// Logger is an interface for optional injection (e.g. into use cases).
// Implementations should respect the Enabled flag.
type Logger interface {
	Debugf(format string, args ...interface{})
}

// DefaultLogger implements Logger using the package-level Enabled flag.
type DefaultLogger struct{}

// Debugf forwards to package Debugf.
func (DefaultLogger) Debugf(format string, args ...interface{}) {
	Debugf(format, args...)
}
