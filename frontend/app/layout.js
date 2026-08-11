import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast"; 
import "./globals.css";



const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "FullStack Auth System",
  description: "Authentication System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Bildirimlerin çıkacağı konumu belirliyoruz */}
        <Toaster position="bottom-right" reverseOrder={false} />
      </body>
    </html>
  );
}