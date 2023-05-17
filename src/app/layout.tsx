import './globals.css';
import '@fontsource/noto-sans-tc';
import '@fontsource/noto-serif-tc';

export const metadata = {
  title: '首頁｜通志分析系統',
  description: '通志脈絡分析系統。（英文待補）',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-TW'>
      <body>{children}</body>
    </html>
  );
}
