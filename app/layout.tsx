import type { Metadata } from "next"
import { JetBrains_Mono, Sora } from "next/font/google"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Providers } from "@/components/Providers"
import AppShell from "@/components/AppShell"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "WriteNow",
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
      className={`${sora.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className={`${sora.className} min-h-full flex flex-col`}>
        <Providers session={session}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
