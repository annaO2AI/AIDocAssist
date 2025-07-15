import React from "react";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} className="z-30 backdivbg">
       <div className="fixed backclose" onClick={onClose}></div>
      <div style={styles.modal} className="shadow-xl rounded-xl border-o3 w-[70%]">
        <button style={styles.closeButton} onClick={onClose}>✖</button>
        {children}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.69)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "99",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    position: "relative",
    overflowY: "auto",
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 30,
    fontSize: 18,
  },
};

export default PopupModal;