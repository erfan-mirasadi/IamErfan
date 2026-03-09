import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://iamerfan.me"),
  title: {
    default: "Step Inside a 3D World — Erfan's Portfolio",
    template: "%s | Erfan Mirasadi",
  },
  description:
    "An award-winning 3D experience. Walk through a fully interactive 3D house built with Three.js, React & Blender. Explore projects, skills, and stories in an immersive WebGL experience — by Erfan Mirasadi.",
  keywords: [
    "Erfan Mirasadi",
    "Erfan",
    "Award-Winning Portfolio",
    "IamErfan",
    "iamerfan.me",
    "Creative Developer",
    "3D Portfolio",
    "Interactive Portfolio",
    "Three.js Developer",
    "React Developer",
    "Next.js Developer",
    "Blender 3D",
    "Web Developer",
    "Frontend Developer",
    "WebGL",
    "React Three Fiber",
    "Immersive Web",
    "Full Stack Developer",
    "JavaScript Developer",
    "3D Web Experience",
    "Immersive Website",
    "Creative Coding",
    "3D Web Creator",
  ],
  authors: [{ name: "Erfan Mirasadi", url: "https://iamerfan.me" }],
  creator: "Erfan Mirasadi",
  publisher: "Erfan Mirasadi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://iamerfan.me",
  },
  openGraph: {
    title: "Step Inside a 3D World — Erfan's Portfolio",
    description:
      "An award-winning 3D experience. Walk through a fully interactive 3D house built with Three.js, React & Blender. Explore projects, skills, and stories in an immersive WebGL experience — by Erfan Mirasadi.",
    type: "website",
    url: "https://iamerfan.me",
    locale: "en_US",
    siteName: "Erfan Mirasadi — Portfolio",
    images: [
      {
        url: "/images/IMG_6140.png",
        width: 1200,
        height: 630,
        alt: "Erfan Mirasadi — Interactive 3D Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Step Inside a 3D World — Erfan's Portfolio",
    description:
      "Not your typical portfolio. Walk through a 3D house, interact with everything — built with Three.js & Blender by Erfan Mirasadi.",
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
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Erfan Mirasadi",
    url: "https://iamerfan.me",
    image: "https://iamerfan.me/images/IMG_6140.png",
    jobTitle: "Creative Developer",
    description:
      "Creative Front-end developer specializing in immersive 3D web experiences and modern frontend development.",
    knowsAbout: [
      "Three.js",
      "React",
      "Next.js",
      "Blender",
      "WebGL",
      "JavaScript",
      "3D Web Development",
      "Frontend Development",
    ],
    // Add your social links here for better SEO authority
    sameAs: [
      "https://github.com/YOUR_GITHUB_USERNAME",
      "https://linkedin.com/in/YOUR_LINKEDIN_USERNAME",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Erfan Mirasadi — Portfolio",
    url: "https://iamerfan.me",
    description:
      "Interactive 3D portfolio of Erfan Mirasadi — a creative developer building immersive web experiences.",
    author: {
      "@type": "Person",
      name: "Erfan Mirasadi",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
