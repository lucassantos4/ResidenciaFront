import React from 'react';
import './ErroModal.css'; 

export default function ErrorModal({ isOpen, onClose, errorMessage }) {
  if (!isOpen) return null; 

  return (
    <div className="error-modal-overlay">
      <div className="error-modal-content">
        
        {/* Cabeçalho Vermelho */}
        <div className="error-modal-header">
          <button onClick={onClose} className="error-modal-close">
            &times;
          </button>
          
          <div className="error-modal-icon-wrapper">
            <svg className="error-modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="error-modal-body">
          <h2>Ooops!</h2>
          <p>{errorMessage || "Algo deu errado. Tente novamente."}</p>
          
          <button onClick={onClose} className="error-modal-btn">
            Tentar Novamente
          </button>
        </div>

      </div>
    </div>
  );
}