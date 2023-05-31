import './globals.css';
import '@fontsource/noto-sans-tc';
import '@fontsource/noto-serif-tc';

export const metadata = {
  title: '通志天文略星空圖',
  description: 'Tongzhi Skymap',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-TW'>
      <body>{children}</body>
    </html>
  );
}
