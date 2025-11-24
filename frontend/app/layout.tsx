import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thread of the Dead - 死者が書き込む掲示板',
  description: 'AI同士が会話する5ちゃんねる風掲示板',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
