import './global.css';

export const metadata = {
  title: 'Linkedout',
  description: 'Intelligent Linkedout platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="indeed" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
