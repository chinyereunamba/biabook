import "@/styles/globals.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";

export const metadata = {
  title: "BiaBook - Simple Appointment Booking",
  description: "Book appointments in 60 seconds with WhatsApp notifications",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          {/* <TRPCReactProvider cookies={cookies().toString()}> */}
          {children}
          {/* </TRPCReactProvider> */}
        </Providers>
      </body>
    </html>
  );
}
