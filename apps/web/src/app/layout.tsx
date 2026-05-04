import './global.css';

export const metadata = {
  title: 'Talent Matching',
  description: 'Intelligent talent matching platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="talent" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
