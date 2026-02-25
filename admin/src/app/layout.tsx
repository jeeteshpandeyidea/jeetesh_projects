import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/ui/toast/ToastContainer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased dark:bg-gray-900" style={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif" }}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <SidebarProvider>{children}</SidebarProvider>
              <ToastContainer />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
