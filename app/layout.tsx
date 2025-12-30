import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "주보 - 늘기쁜교회",
  description: "",
  metadataBase: new URL('https://everjoyful-church.netlify.app'),
  openGraph: {
    title: '주보 - 늘기쁜교회',
    description: '',
    url: 'https://everjoyful-church.netlify.app',
    siteName: '주보 - 늘기쁜교회',
    images: [
      {
        url: '/ever.jpg', // public 폴더에 담긴 대표 이미지 경로
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
