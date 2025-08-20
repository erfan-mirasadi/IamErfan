// ModalManager.js
"use client";

import { createRoot } from "react-dom/client";
import TerminalModal from "./TerminalModal";

let modalRootInstance = null;
let modalContainerEl = null;

function getModalRoot() {
  if (modalRootInstance && modalContainerEl?.isConnected)
    return modalRootInstance;

  modalContainerEl = document.createElement("div");
  document.body.appendChild(modalContainerEl);
  modalRootInstance = createRoot(modalContainerEl);
  return modalRootInstance;
}

export function openModal({
  scriptData,
  modalContainerClassName = "",
  childrenClassName = "",
}) {
  const root = getModalRoot();
  const handleClose = () => closeModal();

  root.render(
    <TerminalModal
      open={true}
      onClose={handleClose}
      modalContainerClassName={modalContainerClassName}
      childrenClassName={childrenClassName}
    >
      {scriptData}
    </TerminalModal>
  );

  // Simple: just add CSS class to disable interactions
  document.body.classList.add("modal-open");

  // غیرفعال کردن کلیک‌ها روی کل صفحه
  document.addEventListener("click", blockClicks, true);
  document.addEventListener("mousedown", blockClicks, true);
  document.addEventListener("mouseup", blockClicks, true);
}

// تابع برای مسدود کردن کلیک‌ها
function blockClicks(e) {
  // اگر کلیک روی modal یا فرزندان آن باشد، اجازه بده
  if (
    e.target.closest('[data-modal="true"]') ||
    e.target.closest(".modal-container")
  ) {
    return;
  }

  // در غیر این صورت، کلیک را متوقف کن
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

export function closeModal() {
  if (modalRootInstance) {
    modalRootInstance.render(null);
  }

  // Simple: just remove CSS class to re-enable interactions
  document.body.classList.remove("modal-open");

  // حذف event listener ها
  document.removeEventListener("click", blockClicks, true);
  document.removeEventListener("mousedown", blockClicks, true);
  document.removeEventListener("mouseup", blockClicks, true);
}
