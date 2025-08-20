import { useEffect, useState } from "react";

export default function ContactMe({ activeStep }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only when activeStep is "contact"
    setIsVisible(activeStep === "contact");
  }, [activeStep]);

  return (
    <div
      className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-20"
          : "opacity-0 -translate-y-[100vh]"
      } bg-black bg-opacity-90 border-2 border-neon-pink shadow-[0_0_15px_#ff2d95] p-8 rounded-lg max-w-md w-full z-[1000]`}
      style={{ fontFamily: "'VT323', monospace" }}
    >
      <h2 className="text-4xl font-bold text-neon-green text-center mb-6 tracking-wider shadow-[0_0_10px_#00ff9f]">
        CONTACT ME
      </h2>
      <div className="space-y-6">
        <a
          href="https://www.linkedin.com/in/erfan-mirasadi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-4 bg-gray-900 border border-neon-blue hover:bg-gray-800 hover:shadow-[0_0_12px_#00b7eb] transition-all duration-300 rounded-md text-2xl text-neon-blue cursor-pointer"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.03-3.06-1.867-3.06-1.867 0-2.153 1.459-2.153 2.966v5.698h-3v-11h2.884v1.509h.041c.402-.758 1.385-1.557 2.851-1.557 3.051 0 3.613 2.008 3.613 4.622v6.426z" />
          </svg>
          <span>LINKEDIN</span>
        </a>
        <a
          href="mailto:erfan.mirasadi@gmail.com"
          className="flex items-center space-x-3 p-4 bg-gray-900 border border-neon-pink hover:bg-gray-800 hover:shadow-[0_0_12px_#ff2d95] transition-all duration-300 rounded-md text-2xl text-neon-pink"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12.713l-11.985-8.713h23.97l-11.985 8.713zm-11.985 1.287v-10.287l7.985 5.787-7.985 4.5zm12 2.287l-8.015-4.5 8.015-5.787 8.015 5.787-8.015 4.5zm11.985-1.287l-7.985-4.5 7.985-5.787v10.287z" />
          </svg>
          <span>EMAIL</span>
        </a>
        {/* <a
          href="https://wa.me/005073542097"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-4 bg-gray-900 border border-neon-green hover:bg-gray-800 hover:shadow-[0_0_12px_#00ff9f] transition-all duration-300 rounded-md text-2xl text-neon-green"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.134.297-.347.446-.52.149-.173.198-.297.297-.445.099-.149.099-.347-.002-.496-.099-.149-.446-.669-.669-.867-.223-.198-.496-.099-.694.05-.197.149-.767.892-.986 1.089-.218.198-.397.297-.595.496-.198.198-.297.497-.297.795 0 .297.099.892.297 1.339.198.446.595 1.437 1.288 2.232.694.795 1.686 1.586 2.678 2.084.992.496 1.884.645 2.529.694.645.05 1.24-.099 1.736-.297.496-.198 1.041-.595 1.189-.892.149-.297.149-.645.05-.795-.099-.149-.347-.223-.644-.372zm-5.472 5.618c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-18c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10z" />
          </svg>
          <span>WHATSAPP</span>
        </a> */}
      </div>
    </div>
  );
}
