import "@/styles/globals.css";
import { Providers } from "./providers";
import { Google_Sans_Flex } from "next/font/google";

// Initialize server-side services (background processor, etc.)
if (typeof window === "undefined") {
  void import("@/server/init");
}

export const metadata = {
  title: "BiaBook - Simple Appointment Booking",
  description: "Book appointments in 60 seconds with WhatsApp notifications",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const google = Google_Sans_Flex({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={google.className}>
      <body>
        <Providers>
          {/* <TRPCReactProvider cookies={cookies().toString()}> */}
          {children}
          {/* </TRPCReactProvider> */}
        </Providers>
      </body>
    </html>
  );
}
