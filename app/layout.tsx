import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gocraft - Tukang Jelas Harga',
  description: 'Solusi instan untuk anak kos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
