import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Providers } from "@/components/Providers"
import AppShell from "@/components/AppShell"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Cover Letter Gen",
  description: "Generate tailored cover letters with your resume and AI research.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers session={session}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
