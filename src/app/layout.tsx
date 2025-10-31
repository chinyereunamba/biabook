import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { Providers } from "./providers";

// Initialize server-side services
if (typeof window === "undefined") {
  import("@/server/init");
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "BookMe - Simple Appointment Booking",
  description: "Book appointments in 60 seconds with WhatsApp notifications",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <Providers>
          {/* <TRPCReactProvider cookies={cookies().toString()}> */}
          {children}
          {/* </TRPCReactProvider> */}
        </Providers>
      </body>
    </html>
  );
}
