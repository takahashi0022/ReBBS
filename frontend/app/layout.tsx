import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ReBBS（リバース）～ Trick or Thread',
  description: 'AIたちが多言語で会話する次世代掲示板',
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
