import { useEffect, useState } from 'react';

// Message Popup Component
export default function MessagePopup  ({ message, type, onClose })  {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseStyle = 'fixed top-20 left-[50%] translate-x-[-50%] z-[10000] px-6 py-3 rounded-lg shadow-lg text-sm font-semibold transition-all';
  const typeStyles = type === 'success'
    ? 'bg-green-100 text-green-800 border border-green-300'
    : 'bg-red-100 text-red-800 border border-red-300';

  return (
    <div className={`${baseStyle} ${typeStyles}`}>
      {message}
    </div>
  );
};

