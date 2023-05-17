import './style.css';

export const metadata = {
  title: '星空圖｜通志分析系統',
  description: '通志天文略星空圖。The Skymap of the Outline of Astronomy from Tongzhi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
