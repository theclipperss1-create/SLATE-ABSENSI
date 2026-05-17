import './globals.css';

export const metadata = {
  title: 'Slate',
  description: 'Mark Your Presence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full scroll-smooth bg-[#FFFFFF] text-[#000000]">
      <body className="min-h-screen flex flex-col antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
