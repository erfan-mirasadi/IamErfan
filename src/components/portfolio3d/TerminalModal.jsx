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
  const dragOffset = useRef({ x: 0, y: 0 });

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
      if (dragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };

    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

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
        className="relative z-10 min-w-[520px] max-w-[90vw] min-h-[320px] rounded-2xl shadow-md
                   bg-gradient-to-r from-[#282c34] via-[#1f2227] to-[#282c34]"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center h-8 px-4 rounded-t-2xl bg-gray-600 border-b border-[#1e1e1e] cursor-move select-none relative"
        >
          {/* Control buttons */}
          <div className="flex gap-2 items-center z-20 relative">
            {/* Close */}
            <span
              onClick={onClose}
              role="button"
              tabIndex={0}
              className="w-3 h-3 rounded-full bg-[#fc5c5b] border border-[#d94f4e] shadow-sm
                 cursor-pointer flex items-center justify-center text-[10px]"
            >
              ×
            </span>

            {/* Minimize */}
            <span
              onClick={() => handleClose()}
              role="button"
              tabIndex={0}
              className="w-3 h-3 rounded-full bg-[#fdbc40] border border-[#d9bb7a] shadow-sm cursor-pointer"
            />

            {/* Maximize */}
            <span className="w-3 h-3 rounded-full bg-[#34c749] border border-[#2da742] shadow-sm" />
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
