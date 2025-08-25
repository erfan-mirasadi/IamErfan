import { useEffect, useState } from "react";

export default function ContactMe({ activeStep }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only when activeStep is "contact"
    setIsVisible(activeStep === "contact");
  }, [activeStep]);

  return (
    <>
      {/* Overlay background with blur */}
      <div
        className={`fixed inset-0 transition-opacity duration-1000 ease-in-out z-20 pointer-events-none ${
          isVisible ? "opacity-100 backdrop-blur-xs" : "opacity-0 "
        }`}
      ></div>

      {/* Main contact card */}
      <div
        className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-[100vh]"
        } bg-black bg-opacity-90 border-2 border-neon-pink shadow-[0_0_15px_#ff2d95] p-4 sm:p-8 rounded-lg max-w-sm sm:max-w-md w-[90vw] sm:w-full z-[1000]`}
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <h2 className="text-2xl sm:text-4xl font-bold text-neon-green text-center mb-4 sm:mb-6 tracking-wider shadow-[0_0_10px_#00ff9f]">
          CONTACT ME
        </h2>
        <div className="space-y-3 sm:space-y-6">
          <a
            href="https://www.linkedin.com/in/erfan-mirasadi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-900 border border-neon-blue hover:bg-gray-800 hover:shadow-[0_0_12px_#00b7eb] transition-all duration-300 rounded-md text-lg sm:text-2xl text-neon-blue cursor-pointer"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.03-3.06-1.867-3.06-1.867 0-2.153 1.459-2.153 2.966v5.698h-3v-11h2.884v1.509h.041c.402-.758 1.385-1.557 2.851-1.557 3.051 0 3.613 2.008 3.613 4.622v6.426z" />
            </svg>
            <span>LINKEDIN</span>
          </a>
          <a
            href="https://github.com/erfan-mirasadi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-900 border border-gray-400 hover:bg-gray-800 hover:shadow-[0_0_12px_#fff] transition-all duration-300 rounded-md text-lg sm:text-2xl text-white cursor-pointer"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.263.82-.582 0-.288-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.76-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.921.43.372.813 1.102.813 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GITHUB</span>
          </a>
          <a
            href="mailto:erfan.mirasadi@gmail.com"
            className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-900 border border-neon-pink hover:bg-gray-800 hover:shadow-[0_0_12px_#ff2d95] transition-all duration-300 rounded-md text-lg sm:text-2xl text-neon-pink"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12.713l-11.985-8.713h23.97l-11.985 8.713zm-11.985 1.287v-10.287l7.985 5.787-7.985 4.5zm12 2.287l-8.015-4.5 8.015-5.787 8.015 5.787-8.015 4.5zm11.985-1.287l-7.985-4.5 7.985-5.787v10.287z" />
            </svg>
            <span>EMAIL</span>
          </a>
          {/* <a
            href="https://wa.me/005073542097"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-900 border border-neon-green hover:bg-gray-800 hover:shadow-[0_0_12px_#00ff9f] transition-all duration-300 rounded-md text-lg sm:text-2xl text-neon-green"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.134.297-.347.446-.52.149-.173.198-.297.297-.445.099-.149.099-.347-.002-.496-.099-.149-.446-.669-.669-.867-.223-.198-.496-.099-.694.05-.197.149-.767.892-.986 1.089-.218.198-.397.297-.595.496-.198.198-.297.497-.297.795 0 .297.099.892.297 1.339.198.446.595 1.437 1.288 2.232.694.795 1.686 1.586 2.678 2.084.992.496 1.884.645 2.529.694.645.05 1.24-.099 1.736-.297.496-.198 1.041-.595 1.189-.892.149-.297.149-.645.05-.795-.099-.149-.347-.223-.644-.372zm-5.472 5.618c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-18c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10z" />
            </svg>
            <span>WHATSAPP</span>
          </a> */}
        </div>
      </div>
    </>
  );
}
