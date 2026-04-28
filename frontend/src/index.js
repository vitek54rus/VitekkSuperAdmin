import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ГЛОБАЛЬНЫЙ СТИЛЬ - ТЕМНЫЙ СПОРТИВНЫЙ
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', 'Segoe UI', 'Montserrat', sans-serif;
    background: radial-gradient(ellipse at top, #1a1a2e, #0a0a0f);
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  /* Carbon fiber texture effect */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.02) 0px,
      rgba(255, 255, 255, 0.02) 2px,
      transparent 2px,
      transparent 8px
    );
    pointer-events: none;
    z-index: 0;
  }
  
  /* Custom scrollbar - racing style */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #0d1117;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #f39c12, #e74c3c);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
  }
  
  /* Glow effects */
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(243, 156, 18, 0.3); }
    50% { box-shadow: 0 0 20px rgba(243, 156, 18, 0.6); }
    100% { box-shadow: 0 0 5px rgba(243, 156, 18, 0.3); }
  }
  
  /* Modal animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  button {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  button:hover {
    transform: translateY(-2px);
  }
  
  input, textarea, select {
    transition: all 0.2s ease;
  }
  
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #f39c12 !important;
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);