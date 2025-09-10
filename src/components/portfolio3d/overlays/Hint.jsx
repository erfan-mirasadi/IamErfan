import { useState, useEffect } from "react";

// hint message text
const HINT_TEXT = " ⊙ Click on the glowing objects to explore... ";
const TYPING_SPEED = 60; // in milliseconds

export default function Hint({ activeStep = "intro" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [autoOpenCount, setAutoOpenCount] = useState(0); // count auto opens

  // check if component should be active
  const isActive = ["Key", "Workshop"].includes(activeStep);

  // auto open/close effect for first visit (only 2 times)
  useEffect(() => {
    if (!isActive || autoOpenCount >= 2) return; // skip if not active or already opened twice

    const openTimer = setTimeout(() => {
      setIsOpen(true);
      setAutoOpenCount((prev) => prev + 1);
    }, 2000); // wait 2 sec

    const closeTimer = setTimeout(() => {
      setIsOpen(false);
    }, 7000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [isActive, autoOpenCount]);

  // auto close after user clicks
  useEffect(() => {
    if (!isActive || !isOpen) return; // dont do anything if not active or closed

    const autoCloseTimer = setTimeout(() => {
      setIsOpen(false);
    }, 5000); // close after 5 seconds

    return () => clearTimeout(autoCloseTimer);
  }, [isOpen, isActive]);

  // close when activeStep changes
  useEffect(() => {
    setIsOpen(false);
  }, [activeStep]);

  // typing animation effect
  useEffect(() => {
    // if closed, clear text immediately
    if (!isOpen) {
      setDisplayedText("");
      return;
    }

    // if open, start typing
    // prevent re-typing if text is already complete
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
            {/* main button with glow effect */}
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

            {/* text container that opens like terminal */}
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
