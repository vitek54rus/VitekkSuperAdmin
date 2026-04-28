import React from 'react';

function CustomModal({ isOpen, onClose, title, children, onConfirm, confirmText = "CONFIRM", cancelText = "CANCEL", type = "default" }) {
  if (!isOpen) return null;

  const getColorByType = () => {
    switch(type) {
      case 'danger': return '#e74c3c';
      case 'success': return '#2ecc71';
      case 'warning': return '#f39c12';
      default: return '#3498db';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0d1117 100%)',
        borderRadius: '12px',
        width: '480px',
        maxWidth: '90%',
        border: `2px solid ${getColorByType()}`,
        boxShadow: `0 0 30px ${getColorByType()}40`
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '15px 20px',
          background: `linear-gradient(135deg, ${getColorByType()}20 0%, transparent 100%)`,
          borderBottom: `1px solid ${getColorByType()}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: getColorByType(), fontSize: '18px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#7f8c8d',
            fontWeight: 'bold'
          }}>×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          {children}
        </div>
        
        {onConfirm && (
          <div style={{ padding: '15px 20px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              padding: '8px 20px',
              background: '#2c3e50',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#ecf0f1',
              fontWeight: '600',
              fontSize: '12px'
            }}>{cancelText}</button>
            <button onClick={onConfirm} style={{
              padding: '8px 20px',
              background: `linear-gradient(135deg, ${getColorByType()} 0%, ${getColorByType()}cc 100%)`,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'white',
              fontWeight: '700',
              fontSize: '12px'
            }}>{confirmText}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomModal;