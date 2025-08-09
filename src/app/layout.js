import "./globals.css";

export const metadata = {
  title: "3D Portfolio House",
  description: "Interactive 3D house portfolio showcase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
