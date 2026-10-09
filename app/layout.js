import './globals.css';

export const metadata = {
  title: 'Die geheime Geburtstagsschatzsuche ✨',
  description: 'Sofias Geburtstagsabenteuer: acht magische Sterne und ein versteckter Schatz.',
  robots: { index: false, follow: false },
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#fbecfa' };

export default function RootLayout({ children }) {
  return <html lang="de"><body>{children}</body></html>;
}
