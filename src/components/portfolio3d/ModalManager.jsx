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
}

export function closeModal() {
  if (modalRootInstance) {
    modalRootInstance.render(null);
  }
}
