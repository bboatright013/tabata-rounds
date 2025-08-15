export default function StackrushLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        blockSize: 'calc(100svh - var(--header-h, 64px) - var(--footer-h, 64px))',
        marginTop: 'var(--header-h, 64px)',
        marginBottom: 'var(--footer-h, 64px)'
      }}
    >
      {children}
    </div>
  )
}