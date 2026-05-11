import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aisle - Your Wedding Venue AI Assistant',
  description: 'Find your perfect wedding venue with AI-powered assistance',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FDF8F3',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased overflow-x-hidden">
        <AppProvider>
          {children}
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
