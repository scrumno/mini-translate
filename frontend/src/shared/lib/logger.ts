/**
 * Centralized debug logging. Controlled by .env: VITE_DEBUG=true to enable.
 */
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export function log(...args: unknown[]): void {
  if (DEBUG) {
    console.log(...args)
  }
}

export function logGroup(label: string, ...args: unknown[]): void {
  if (DEBUG) {
    console.group(label)
    console.log(...args)
    console.groupEnd()
  }
}
