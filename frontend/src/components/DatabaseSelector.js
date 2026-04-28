import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function DatabaseSelector({ onSelectDb, showAlert }) {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [creating, setCreating] = useState(false);
  const [adminConfig, setAdminConfig] = useState({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: ''
  });
  const [newConnection, setNewConnection] = useState({
    name: '',
    host: 'localhost',
    port: '5432',
    database: '',
    user: 'postgres',
    password: ''
  });

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/databases`);
      setDatabases(response.data.databases || []);
    } catch (err) {
      showAlert('Error', err.message, 'error');
    }
    setLoading(false);
  };

  const createDatabase = async () => {
    if (!newDbName.trim()) {
      showAlert('Error', 'Enter database name', 'error');
      return;
    }
    
    setCreating(true);
    try {
      const response = await axios.post(`${API_BASE}/databases/create`, {
        db_name: newDbName,
        admin_config: adminConfig
      });
      if (response.data.success) {
        showAlert('Success', `Database "${newDbName}" created`, 'success');
        await loadDatabases();
        setShowCreateForm(false);
        setNewDbName('');
      } else {
        showAlert('Error', response.data.error, 'error');
      }
    } catch (err) {
      showAlert('Error', err.message, 'error');
    }
    setCreating(false);
  };

  const addConnection = async () => {
    if (!newConnection.name.trim() || !newConnection.database.trim()) {
      showAlert('Error', 'Fill name and database', 'error');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE}/databases`, newConnection);
      if (response.data.success) {
        showAlert('Success', `Connection added`, 'success');
        await loadDatabases();
        setShowAddForm(false);
        setNewConnection({
          name: '',
          host: 'localhost',
          port: '5432',
          database: '',
          user: 'postgres',
          password: ''
        });
      } else {
        showAlert('Error', response.data.error, 'error');
      }
    } catch (err) {
      showAlert('Error', err.message, 'error');
    }
  };

  const deleteDatabase = async (dbName) => {
    if (!window.confirm(`Delete "${dbName}"?`)) return;
    
    try {
      await axios.delete(`${API_BASE}/databases/${dbName}`);
      showAlert('Success', `Deleted`, 'success');
      await loadDatabases();
    } catch (err) {
      showAlert('Error', err.message, 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0d1117 100%)',
        borderRadius: '16px',
        padding: '40px',
        width: '500px',
        border: '1px solid #f39c12',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '50px' }}>🗄️</div>
          <h2 style={{ color: '#f39c12', marginTop: '10px' }}>DATABASES</h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setShowCreateForm(true)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            + CREATE NEW DB
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            + ADD EXISTING
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#f39c12' }}>LOADING...</div>
        ) : databases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            No databases<br/>
            Click "Create New DB" to start
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {databases.map(db => (
              <div
                key={db}
                onClick={() => onSelectDb(db)}
                style={{
                  padding: '15px',
                  margin: '10px 0',
                  background: '#0a0a0f',
                  border: '1px solid #2c3e50',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f39c12'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2c3e50'; }}
              >
                <span style={{ color: '#f39c12', fontSize: '16px' }}>{db}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteDatabase(db); }}
                  style={{ background: '#e74c3c', border: 'none', borderRadius: '4px', padding: '4px 10px', color: 'white', cursor: 'pointer' }}
                >
                  DELETE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Database Modal - inline version without CustomModal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowCreateForm(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            width: '450px',
            maxWidth: '90%',
            border: '2px solid #2ecc71'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '15px 20px',
              borderBottom: '1px solid #2ecc71',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ color: '#2ecc71', margin: 0 }}>CREATE NEW DATABASE</h3>
              <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#f39c12', fontSize: '12px', display: 'block', marginBottom: '5px' }}>NEW DATABASE NAME</label>
                <input
                  type="text"
                  value={newDbName}
                  onChange={e => setNewDbName(e.target.value)}
                  placeholder="e.g., mydb, testdb"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
              
              <div style={{ borderTop: '1px solid #2c3e50', paddingTop: '15px' }}>
                <p style={{ color: '#7f8c8d', fontSize: '11px', marginBottom: '10px' }}>PostgreSQL Server Connection:</p>
                <input
                  type="text"
                  placeholder="Host"
                  value={adminConfig.host}
                  onChange={e => setAdminConfig({...adminConfig, host: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
                <input
                  type="text"
                  placeholder="Port"
                  value={adminConfig.port}
                  onChange={e => setAdminConfig({...adminConfig, port: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={adminConfig.user}
                  onChange={e => setAdminConfig({...adminConfig, user: e.target.value})}
                  style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminConfig.password}
                  onChange={e => setAdminConfig({...adminConfig, password: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateForm(false)} style={{ padding: '8px 20px', background: '#2c3e50', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={createDatabase} disabled={creating} style={{ padding: '8px 20px', background: '#2ecc71', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>{creating ? 'CREATING...' : 'CREATE'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Database Modal - inline version without CustomModal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowAddForm(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            width: '450px',
            maxWidth: '90%',
            border: '2px solid #3498db'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '15px 20px',
              borderBottom: '1px solid #3498db',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ color: '#3498db', margin: 0 }}>ADD EXISTING DATABASE</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Connection Name (e.g., MyDB)"
                  value={newConnection.name}
                  onChange={e => setNewConnection({...newConnection, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Host"
                  value={newConnection.host}
                  onChange={e => setNewConnection({...newConnection, host: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Port"
                  value={newConnection.port}
                  onChange={e => setNewConnection({...newConnection, port: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Database Name"
                  value={newConnection.database}
                  onChange={e => setNewConnection({...newConnection, database: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={newConnection.user}
                  onChange={e => setNewConnection({...newConnection, user: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={newConnection.password}
                  onChange={e => setNewConnection({...newConnection, password: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                />
              </div>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddForm(false)} style={{ padding: '8px 20px', background: '#2c3e50', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={addConnection} style={{ padding: '8px 20px', background: '#3498db', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>ADD</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseSelector;