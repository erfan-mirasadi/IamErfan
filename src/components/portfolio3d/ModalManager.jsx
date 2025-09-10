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

  // just add CSS class to disable interactions
  document.body.classList.add("modal-open");

  // disable clicks on entire page
  document.addEventListener("click", blockClicks, true);
  document.addEventListener("mousedown", blockClicks, true);
  document.addEventListener("mouseup", blockClicks, true);
}

// function to block clicks
function blockClicks(e) {
  if (
    e.target.closest('[data-modal="true"]') ||
    e.target.closest(".modal-container")
  ) {
    return;
  }

  // otherwise, stop the click
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

export function closeModal() {
  if (modalRootInstance) {
    modalRootInstance.render(null);
  }

  // just remove CSS class to re-enable interactions
  document.body.classList.remove("modal-open");

  // remove event listeners
  document.removeEventListener("click", blockClicks, true);
  document.removeEventListener("mousedown", blockClicks, true);
  document.removeEventListener("mouseup", blockClicks, true);
}
