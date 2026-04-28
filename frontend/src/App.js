import React, { useState } from 'react';
import ConnectionForm from './components/ConnectionForm';
import TableList from './components/TableList';
import DataView from './components/DataView';
import QueryEditor from './components/QueryEditor';
import AlertModal from './components/AlertModal';

function App() {
  const [connected, setConnected] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [alert, setAlert] = useState({ show: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlert({ show: true, title, message, type });
  };

  if (!connected) {
    return <ConnectionForm onConnect={() => setConnected(true)} showAlert={showAlert} />;
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <AlertModal 
        isOpen={alert.show} 
        onClose={() => setAlert({ ...alert, show: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
      
      {/* HEADER - RACING STYLE */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        borderBottom: '2px solid #f39c12',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        padding: '15px 30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #f39c12, transparent)',
          animation: 'slide 2s linear infinite'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #f39c12, #e74c3c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px'
            }}>
              ⚡ VITEKK SUPER ADMIN ⚡
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '12px', letterSpacing: '2px' }}>
              ULTIMATE DATABASE CONTROL SYSTEM
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', background: '#2ecc71', borderRadius: '50%', boxShadow: '0 0 5px #2ecc71' }} />
            <div style={{ width: '10px', height: '10px', background: '#f39c12', borderRadius: '50%', boxShadow: '0 0 5px #f39c12' }} />
            <div style={{ width: '10px', height: '10px', background: '#e74c3c', borderRadius: '50%', boxShadow: '0 0 5px #e74c3c' }} />
          </div>
        </div>
      </div>
      
      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', padding: '20px', gap: '20px', minHeight: 'calc(100vh - 90px)' }}>
        <div style={{ width: '320px' }}>
          <TableList onSelectTable={setSelectedTable} selectedTable={selectedTable} showAlert={showAlert} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DataView table={selectedTable} showAlert={showAlert} />
          <QueryEditor onTableCreated={() => {}} showAlert={showAlert} />
        </div>
      </div>
    </div>
  );
}

export default App;