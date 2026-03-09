export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/draco/", "/models/"],
      },
    ],
    sitemap: "https://iamerfan.me/sitemap.xml",
  };
}
