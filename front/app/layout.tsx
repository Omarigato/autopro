import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "AutoPro - Premium Car Rental",
  description: "Rent the best cars in Kazakhstan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
      </body>
    </html>
  );
}
