import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://iamerfan.me"),
  title: "IamErfan",
  description:
    "An immersive 3D portfolio experience built with Blender and modern web technologies. Explore my creative universe in an interactive 3D house environment.",
  keywords: [
    "3D Portfolio",
    "Blender",
    "Three.js",
    "React",
    "Next.js",
    "Web Development",
    "3D Modeling",
  ],
  authors: [{ name: "Erfan Mirasadi" }],
  creator: "Erfan Mirasadi",
  publisher: "Erfan Mirasadi",
  robots: "index, follow",
  openGraph: {
    title: "IamErfan",
    description:
      "An immersive 3D portfolio experience built with Blender and modern web technologies",
    type: "website",
    locale: "en_US",
    siteName: "IamErfan",
    images: [
      {
        url: "/images/IMG_6140.png",
        width: 1200,
        height: 630,
        alt: "IamErfan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IamErfan",
    description:
      "An immersive 3D portfolio experience built with Blender and modern web technologies",
    images: ["/images/IMG_6140.png"],
  },
  icons: {
    icon: [
      { url: "/images/IMG_6140.png", sizes: "32x32", type: "image/png" },
      { url: "/images/IMG_6140.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/images/IMG_6140.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/IMG_6140.png" />
        <link rel="apple-touch-icon" href="/images/IMG_6140.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
