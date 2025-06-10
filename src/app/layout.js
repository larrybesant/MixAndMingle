export const metadata = {
  title: "Mix & Mingle - Where Music Meets Connection",
  description: "AI-powered social networking for music lovers",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
