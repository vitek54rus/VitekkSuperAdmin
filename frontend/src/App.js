import React, { useState, useEffect } from 'react';
import ConnectionForm from './components/ConnectionForm';
import DatabaseSelector from './components/DatabaseSelector';
import TableList from './components/TableList';
import DataView from './components/DataView';
import QueryEditor from './components/QueryEditor';
import AlertModal from './components/AlertModal';

function App() {
  const [connected, setConnected] = useState(false);
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [alert, setAlert] = useState({ show: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlert({ show: true, title, message, type });
  };

  if (!connected) {
    return <ConnectionForm onConnect={() => setConnected(true)} showAlert={showAlert} />;
  }

  if (!selectedDb) {
    return <DatabaseSelector onSelectDb={setSelectedDb} showAlert={showAlert} />;
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
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        borderBottom: '2px solid #f39c12',
        padding: '15px 30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #f39c12, #e74c3c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VITEKK SUPER ADMIN
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '12px' }}>
              ACTIVE DATABASE: {selectedDb}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setSelectedDb(null)}
              style={{ background: '#2c3e50', color: '#f39c12', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}
            >
              CHANGE DATABASE
            </button>
            <div style={{ width: '10px', height: '10px', background: '#2ecc71', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ display: 'flex', padding: '20px', gap: '20px', minHeight: 'calc(100vh - 90px)' }}>
        <div style={{ width: '320px' }}>
          <TableList 
            dbName={selectedDb}
            onSelectTable={setSelectedTable} 
            selectedTable={selectedTable} 
            showAlert={showAlert}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DataView 
            dbName={selectedDb}
            table={selectedTable} 
            showAlert={showAlert} 
          />
          <QueryEditor 
            dbName={selectedDb}
            showAlert={showAlert} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;