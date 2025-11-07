import "@/styles/globals.css";
import localFont from "next/font/local";
import { Providers } from "./providers";

if (typeof window === "undefined") {
  import("@/server/init");
}

export const metadata = {
  title: "BiaBook - Simple Appointment Booking",
  description: "Book appointments in 60 seconds with WhatsApp notifications",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const outfit = localFont({
  src: [
    {
      path: "../../public/fonts/Outfit-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Outfit-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Outfit-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
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
