import { tokens } from '../tokens'

export function Divider() {
  return <div style={{ height: '1px', background: tokens.borderSubtle, flexShrink: 0 }} />
}
