import type { Metadata } from "next";
import { Inter, Patrick_Hand, Caveat, Pacifico, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const patrickHand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-patrick-hand" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Special Wish Creator",
  description: "Create magical, animated scrapbooks and wishes for your loved ones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${patrickHand.variable} ${caveat.variable} ${pacifico.variable} ${dancingScript.variable} ${playfair.variable} antialiased bg-slate-50 text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
