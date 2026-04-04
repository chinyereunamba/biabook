import "@/styles/globals.css";
import { Providers } from "./providers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

export const metadata = {
  title: "BiaBook | Scheduling Simplified for Nigeria",
  description: "Save hours of back-and-forth messaging. Automate your bookings and reduce no-shows by 94% with BiaBook.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans font-display antialiased text-foreground bg-background">
        <Providers>
          {/* <TRPCReactProvider cookies={cookies().toString()}> */}
          {children}
          {/* </TRPCReactProvider> */}
        </Providers>
      </body>
    </html>
  );
}
