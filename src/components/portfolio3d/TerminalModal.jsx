import React, { useState, useRef, useEffect } from "react";
import TypewriterScript from "./TypewriterScript";
import TerminalPrompt from "./TerminalPrompt";
import UnlockSequence from "./UnlockSequence";

const TITLE = "erfan — erfan@mac — ~ — -zsh — 80×24";

// "Last login: Wed Nov  4 12:21:54 on ttys000", in the visitor's own clock
function lastLoginLine(date) {
  const day = date.toLocaleString("en-US", { weekday: "short" });
  const month = date.toLocaleString("en-US", { month: "short" });
  const time = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  return `Last login: ${day} ${month} ${String(date.getDate()).padStart(2, " ")} ${time} on ttys000`;
}

// macOS traffic light glyphs (they show while the buttons are hovered)
function CloseGlyph() {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <path d="M2 2l4 4M6 2L2 6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function MinimizeGlyph() {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <path d="M1.5 4h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ZoomGlyph() {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <path d="M2 2h3.3L2 5.3zM6 6H2.7L6 2.7z" fill="currentColor" />
    </svg>
  );
}

// the little blue folder in front of the title
function FolderIcon() {
  return (
    <svg className="mac-term-folder" viewBox="0 0 16 13" aria-hidden="true">
      <path d="M1 2.2C1 1.54 1.54 1 2.2 1h3.5l1.5 1.5h6.6c.66 0 1.2.54 1.2 1.2V5H1z" fill="#5aa7ec" />
      <path d="M1 4.2h14v7.6c0 .66-.54 1.2-1.2 1.2H2.2C1.54 13 1 12.46 1 11.8z" fill="#8ec5f6" />
    </svg>
  );
}

export default function TerminalModal({
  open,
  onClose,
  children,
  modalContainerClassName = "",
  childrenClassName = "",
  unlockSequence = false, // after the script: the fast "install" log, then auto close
}) {
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [scriptTyped, setScriptTyped] = useState(false);
  const installing = unlockSequence && scriptTyped;
  const [lastLogin] = useState(() => lastLoginLine(new Date()));
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
      // save original position and size
      originalPosition.current = { ...position };
      originalSize.current = {
        width: modal.offsetWidth,
        height: modal.offsetHeight,
      };

      // expand modal (mobile restrictions)
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
      // return to original size
      modal.style.transition = "all 0.3s ease";
      modal.style.width = originalSize.current.width + "px";
      modal.style.height = originalSize.current.height + "px";
      modal.style.maxWidth = "90vw";
      modal.style.maxHeight = "90vh";

      // restore position with delay to prevent bugs
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

      {/* modal window */}
      <div
        ref={modalRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "top left",
        }}
        className="mac-term-window relative z-10 min-w-[320px] sm:min-w-[480px] md:min-w-[500px] lg:min-w-[620px] xl:min-w-[700px] max-w-[90vw] min-h-[240px] sm:min-h-[320px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px]"
      >
        {/* window header: macOS Terminal title bar */}
        <div onMouseDown={handleMouseDown} className="mac-term-titlebar">
          {/* traffic lights (same actions as before: close, minimize, maximize) */}
          <div className="mac-term-lights">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="mac-term-light is-close"
            >
              <CloseGlyph />
            </button>
            <button
              type="button"
              onClick={() => handleClose()}
              aria-label="Minimize"
              className="mac-term-light is-minimize"
            >
              <MinimizeGlyph />
            </button>
            <button
              type="button"
              onClick={handleMaximize}
              aria-label={isMaximized ? "Restore" : "Maximize"}
              className="mac-term-light is-zoom"
            >
              <ZoomGlyph />
            </button>
          </div>

          {/* window title */}
          <div className="mac-term-title">
            <FolderIcon />
            <span>{TITLE}</span>
          </div>
        </div>

        {/* modal content */}
        <div
          className={`mac-term-body px-[10px] pt-1.5 pb-5 whitespace-pre-line ${childrenClassName}`}
          style={{ minHeight: 240 }}
        >
          <div className="whitespace-pre-wrap">{lastLogin}</div>
          {Array.isArray(children) ? (
            <>
              <TypewriterScript
                script={children}
                speed={50}
                onDone={unlockSequence ? () => setScriptTyped(true) : undefined}
                cursor={!installing}
                prompt={<TerminalPrompt />}
              />
              {installing && <UnlockSequence onFinish={handleClose} />}
            </>
          ) : (
            <TypewriterScript
              script={[
                {
                  type: "normal",
                  text: typeof children === "string" ? children : "",
                },
              ]}
              speed={50}
              prompt={<TerminalPrompt />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
