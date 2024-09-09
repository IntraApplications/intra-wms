import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setModalContent(children);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setModalContent(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, children]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center rounded-[5px] justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative bg-primary rounded-[5px] shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X size={24} />
        </button>
        <div className="modal-content transition-all duration-300 ease-in-out">
          {modalContent}
        </div>
      </div>
    </div>
  );
};

export default Modal;
