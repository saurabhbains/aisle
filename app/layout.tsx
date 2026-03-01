import type { Metadata, Viewport } from 'next'
import { Crimson_Text, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/context'
import './globals.css'

const crimsonText = Crimson_Text({ 
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

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
      <body className={`${crimsonText.variable} ${inter.variable} font-sans antialiased`}>
        <AppProvider>
          {children}
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
