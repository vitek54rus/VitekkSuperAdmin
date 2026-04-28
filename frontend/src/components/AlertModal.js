import React, { useEffect } from 'react';

function AlertModal({ isOpen, onClose, title, message, type = "info" }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getColor = () => {
    switch(type) {
      case 'error': return '#e74c3c';
      case 'success': return '#2ecc71';
      case 'warning': return '#f39c12';
      default: return '#3498db';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'error': return '❌';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
      animation: 'slideInRight 0.3s ease'
    }}>
      <div style={{
        background: '#1a1a2e',
        borderLeft: `4px solid ${getColor()}`,
        borderRadius: '8px',
        padding: '15px 20px',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 10px ${getColor()}40`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{getIcon()}</span>
          <div>
            <h4 style={{ margin: 0, color: getColor(), fontSize: '14px', fontWeight: '700' }}>{title}</h4>
            <p style={{ margin: '5px 0 0 0', color: '#ecf0f1', fontSize: '12px' }}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;