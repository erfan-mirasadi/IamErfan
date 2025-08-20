import React, { useState, useRef, useEffect } from "react";
import TypewriterScript from "./TypewriterScript";

export default function TerminalModal({
  open,
  onClose,
  children,
  modalContainerClassName = "",
  childrenClassName = "",
}) {
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const originalPosition = useRef({ x: 0, y: 0 });
  const originalSize = useRef({ width: 0, height: 0 });

  const handleClose = () => {
    const modal = modalRef.current;
    if (!modal) return;
    modal.style.transition = "transform 0.2s ease, opacity 0.2s ease";
    modal.style.transform = "scale(0.9)";
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      if (onClose) onClose();
    }, 200);
  };

  const handleMaximize = () => {
    const modal = modalRef.current;
    if (!modal) return;

    if (!isMaximized) {
      // ذخیره موقعیت و اندازه اصلی
      originalPosition.current = { ...position };
      originalSize.current = {
        width: modal.offsetWidth,
        height: modal.offsetHeight,
      };

      // بزرگ کردن modal (برای mobile محدودیت)
      modal.style.transition = "all 0.3s ease";
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        modal.style.width = "95vw";
        modal.style.height = "95vh";
        modal.style.maxWidth = "95vw";
        modal.style.maxHeight = "95vh";
        setPosition({ x: 0, y: 0 });
      } else {
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.maxWidth = "100vw";
        modal.style.maxHeight = "100vh";
        setPosition({ x: 0, y: 0 });
      }
      setIsMaximized(true);
    } else {
      // برگرداندن به اندازه اصلی
      modal.style.transition = "all 0.3s ease";
      modal.style.width = originalSize.current.width + "px";
      modal.style.height = originalSize.current.height + "px";
      modal.style.maxWidth = "90vw";
      modal.style.maxHeight = "90vh";

      // برگرداندن موقعیت با delay برای جلوگیری از bug
      setTimeout(() => {
        setPosition(originalPosition.current);
        setIsMaximized(false);
      }, 300);
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !modalRef.current) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };

    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, isMaximized]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center modal-container ${modalContainerClassName}`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-0 transition-all duration-300 backdrop-blur-xs"
        onClick={onClose}
        style={{ pointerEvents: "auto" }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "top left",
        }}
        className="relative z-10 min-w-[320px] sm:min-w-[480px] md:min-w-[500px] lg:min-w-[620px] xl:min-w-[700px] max-w-[90vw] min-h-[240px] sm:min-h-[320px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px] rounded-2xl shadow-md
                   bg-gradient-to-r from-[#282c34] via-[#1f2227] to-[#282c34]"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center h-8 px-4 rounded-t-2xl bg-gray-600 border-b border-[#1e1e1e] cursor-move select-none relative"
        >
          {/* Control buttons */}
          <div className="flex gap-1.5 sm:gap-2 items-center z-20 relative group">
            {/* Close */}
            <span
              onClick={onClose}
              role="button"
              tabIndex={0}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#fc5c5b] border border-[#d94f4e] shadow-sm
                 cursor-pointer flex items-center justify-center text-[8px] sm:text-[10px] text-black/40 font-bold leading-none"
            >
              <span className="opacity-0 group-hover:opacity-100">×</span>
            </span>

            {/* Minimize */}
            <span
              onClick={() => handleClose()}
              role="button"
              tabIndex={0}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#fdbc40] border border-[#d9bb7a] shadow-sm cursor-pointer flex items-center justify-center text-[8px] sm:text-[12px] text-black/40 font-bold leading-none"
            >
              <span className="opacity-0 group-hover:opacity-100">-</span>
            </span>

            {/* Maximize */}
            <span
              onClick={handleMaximize}
              role="button"
              tabIndex={0}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#34c749] border border-[#2da742] shadow-sm cursor-pointer flex items-center justify-center text-[8px] sm:text-[10px] text-black/40 font-bold leading-none"
            >
              <span className="opacity-0 group-hover:opacity-100">
                {isMaximized ? "□" : "□"}
              </span>
            </span>
          </div>

          {/* Title */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <span className="text-xs text-gray-400 font-mono tracking-wide">
              Terminal — bash
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className={`px-6 pt-4 pb-6 text-white/80 font-vt323 font-bold text-2xl whitespace-pre-line ${childrenClassName}`}
          style={{ minHeight: 240 }}
        >
          {Array.isArray(children) ? (
            <TypewriterScript script={children} speed={50} />
          ) : (
            <TypewriterScript
              script={[
                {
                  type: "normal",
                  text: typeof children === "string" ? children : "",
                },
              ]}
              speed={50}
            />
          )}
        </div>
      </div>
    </div>
  );
}
