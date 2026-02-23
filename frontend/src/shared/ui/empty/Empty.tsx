import { tokens } from '../tokens'

export function Empty({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px 0',
        color: tokens.textDim,
        fontSize: tokens.fontSize.sm,
      }}
    >
      {message}
    </div>
  )
}
