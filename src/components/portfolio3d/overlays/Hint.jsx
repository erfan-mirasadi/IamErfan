import { useState, useEffect } from "react";

// متن کامل راهنما
const HINT_TEXT = " ⊙ Click on the glowing objects to explore... ";
const TYPING_SPEED = 60; // میلی‌ثانیه

export default function Hint({ activeStep = "intro" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [autoOpenCount, setAutoOpenCount] = useState(0); // شمارنده باز شدن خودکار

  // بررسی اینکه آیا کامپوننت باید فعال باشد
  const isActive = ["Key", "Workshop"].includes(activeStep);

  // Effect برای باز/بسته شدن خودکار در اولین بازدید (فقط 2 بار)
  useEffect(() => {
    if (!isActive || autoOpenCount >= 2) return; // اگر غیرفعال است یا 2 بار باز شده، هیچ کاری نکن

    const openTimer = setTimeout(() => {
      setIsOpen(true);
      setAutoOpenCount((prev) => prev + 1);
    }, 2000); // 2 ثانیه

    const closeTimer = setTimeout(() => {
      setIsOpen(false);
    }, 7000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [isActive, autoOpenCount]);

  // Effect برای بسته شدن خودکار بعد از کلیک کاربر
  useEffect(() => {
    if (!isActive || !isOpen) return; // اگر غیرفعال است یا بسته است، هیچ کاری نکن

    const autoCloseTimer = setTimeout(() => {
      setIsOpen(false);
    }, 5000); // 5 ثانیه

    return () => clearTimeout(autoCloseTimer);
  }, [isOpen, isActive]);

  // Effect برای بسته کردن کامپوننت وقتی activeStep تغییر می‌کند
  useEffect(() => {
    setIsOpen(false);
  }, [activeStep]);

  // Effect برای انیمیشن تایپ کردن متن
  useEffect(() => {
    // اگر بسته است، متن را فورا پاک کن
    if (!isOpen) {
      setDisplayedText("");
      return;
    }

    // اگر باز است، شروع به تایپ کن
    // جلوگیری از تایپ مجدد اگر متن کامل شده
    if (displayedText.length === HINT_TEXT.length) {
      return;
    }

    const typingInterval = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < HINT_TEXT.length) {
          return HINT_TEXT.slice(0, prev.length + 1);
        } else {
          clearInterval(typingInterval);
          return prev;
        }
      });
    }, TYPING_SPEED);

    // Cleanup function
    return () => clearInterval(typingInterval);
  }, [isOpen]);

  return (
    <>
      {isActive && (
        <div className="fixed bottom-10 left-4 md:left-10 font-vt323 text-xl scale-75 md:scale-100">
          <div className="relative flex items-center h-12">
            {/* دکمه اصلی با جلوه درخشش */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                w-12 h-12 rounded-full bg-black flex items-center justify-center 
                text-green-400 text-3xl z-10
                border-2 border-green-400/80
                transition-all duration-300
                hover:bg-green-400 hover:text-black hover:shadow-none
                animate-[pulseGlow_4s_ease-in-out_infinite] cursor-pointer
              `}
              style={{ boxShadow: "0 0 15px 3px rgba(34, 197, 94, 0.5)" }}
            >
              ?
            </button>

            {/* کانتینر متن که مثل ترمینال باز میشه */}
            <div
              className={`
                absolute left-6 h-full flex items-center bg-black 
                pl-8 pr-4
                border border-green-400/50
                overflow-hidden transition-[max-width,opacity] duration-700 ease-in-out
                ${isOpen ? "max-w-md opacity-100" : "max-w-0 opacity-0"}
              `}
            >
              <p className="text-green-400 whitespace-nowrap [text-shadow:0_0_5px_theme(colors.green.400)]">
                {displayedText}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
