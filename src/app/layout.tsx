import "./globals.css";
import { Providers } from "./providers"; // 👈 เพิ่มตรงนี้

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* 👈 ห่อ children ด้วย Provider */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
