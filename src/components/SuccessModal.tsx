import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center space-y-4 animate-in slide-in-from-bottom-10 duration-400 max-w-[90%]">
        <h1 className="font-hindi text-primary text-3xl font-bold">Thank You!</h1>
        <p className="font-hindi text-gray-600 text-lg">Our team will contact you soon.</p>
      </div>
    </div>
  );
};
