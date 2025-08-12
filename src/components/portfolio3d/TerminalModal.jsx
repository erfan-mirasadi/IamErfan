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

  const handleMouseDown = (e) => {
    if (e.button === 0 && modalRef.current) {
      setDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
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
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  if (!open) return null;

  return (
    <div
      className={`${modalContainerClassName} fixed inset-0 flex items-center justify-center`}
    >
      <div className="fixed inset-0 z-0 backdrop-blur-sm pointer-events-none" />
      <div
        ref={modalRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "top left",
        }}
        className="relative z-10 min-w-[420px] max-w-[90vw] min-h-[320px] rounded-2xl shadow-md bg-gradient-to-r from-[#282c34] via-[#1f2227] to-[#282c34]"
      >
        <div
          className="flex items-center h-8 px-4 rounded-t-2xl bg-gray-600 border-b border-[#1e1e1e] cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex gap-2 items-center">
            <span
              className="w-3 h-3 rounded-full bg-[#fc5c5b] border border-[#d94f4e] shadow-sm cursor-pointer flex items-center justify-center relative"
              onClick={onClose}
              role="button"
              tabIndex={0}
            >
              ×
            </span>
            <span className="w-3 h-3 rounded-full bg-[#fdbc40] border border-[#d9bb7a] shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#34c749] border border-[#2da742] shadow-sm"></span>
          </div>
          <div className="flex-1 text-center text-xs text-gray-400 font-mono tracking-wide">
            Terminal — bash
          </div>
        </div>
        <div
          className={`px-6 pt-4 pb-6 text-cyan-600 font-vt323 text-2xl whitespace-pre-line ${childrenClassName}`}
          style={{ minHeight: 240 }}
        >
          {Array.isArray(children) ? (
            <TypewriterScript script={children} speed={30} />
          ) : (
            <TypewriterScript
              script={[
                {
                  type: "normal",
                  text: typeof children === "string" ? children : "",
                },
              ]}
              speed={30}
            />
          )}
        </div>
      </div>
    </div>
  );
}
