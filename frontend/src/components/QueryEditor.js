import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function QueryEditor({ onTableCreated, showAlert }) {
  const [sql, setSql] = useState('SELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [savedQueries, setSavedQueries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [showSystem, setShowSystem] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vitekk_saved_queries');
    if (saved) setSavedQueries(JSON.parse(saved));
    
    const history = localStorage.getItem('vitekk_query_history');
    if (history) setQueryHistory(JSON.parse(history));
    
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/system/info');
      if (response.data.success) setSystemInfo(response.data);
    } catch (err) {
      console.log('System info error:', err);
    }
  };

  const executeQuery = async () => {
    if (!sql.trim()) {
      showAlert('Warning', 'Enter SQL query', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/query/`, { sql });
      const data = response.data;
      
      if (data.success) {
        setResult(data);
        showAlert('Success', 'Query executed successfully', 'success');
        
        const newHistory = [{
          id: Date.now(),
          sql: sql,
          timestamp: new Date().toLocaleString(),
          success: true
        }, ...queryHistory].slice(0, 20);
        
        setQueryHistory(newHistory);
        localStorage.setItem('vitekk_query_history', JSON.stringify(newHistory));
        
        const sqlUpper = sql.toUpperCase();
        if (sqlUpper.includes('CREATE TABLE') || sqlUpper.includes('DROP TABLE')) {
          if (onTableCreated) onTableCreated();
          loadSystemInfo();
        }
      } else {
        setResult({ success: false, error: data.error });
        showAlert('Error', data.error, 'error');
        
        const newHistory = [{
          id: Date.now(),
          sql: sql,
          timestamp: new Date().toLocaleString(),
          success: false,
          error: data.error
        }, ...queryHistory].slice(0, 20);
        
        setQueryHistory(newHistory);
        localStorage.setItem('vitekk_query_history', JSON.stringify(newHistory));
      }
    } catch (err) {
      setResult({ success: false, error: err.message });
      showAlert('Error', err.message, 'error');
    }
    setIsLoading(false);
  };

  const saveCurrentQuery = () => {
    if (!sql.trim()) {
      showAlert('Warning', 'No query to save', 'warning');
      return;
    }
    
    const queryName = prompt('Enter query name:', `Query ${savedQueries.length + 1}`);
    if (!queryName) return;
    
    const newSaved = [...savedQueries, {
      id: Date.now(),
      name: queryName,
      sql: sql,
      date: new Date().toLocaleString()
    }];
    setSavedQueries(newSaved);
    localStorage.setItem('vitekk_saved_queries', JSON.stringify(newSaved));
    showAlert('Success', 'Query saved', 'success');
  };

  const loadSavedQuery = (query) => {
    setSql(query.sql);
    showAlert('Success', `Loaded: ${query.name}`, 'success');
  };

  const deleteSavedQuery = (queryId) => {
    const newSaved = savedQueries.filter(q => q.id !== queryId);
    setSavedQueries(newSaved);
    localStorage.setItem('vitekk_saved_queries', JSON.stringify(newSaved));
    showAlert('Success', 'Query deleted', 'success');
  };

  const clearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem('vitekk_query_history');
    showAlert('Success', 'History cleared', 'success');
  };

  const handleExport = async () => {
    if (!sql.trim()) {
      showAlert('Warning', 'Enter SELECT query to export', 'warning');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/query/export`, { sql });
      const data = response.data;
      
      if (data.success) {
        setExportResult(data);
        setShowExportModal(true);
        showAlert('Success', `Exported ${data.count} records`, 'success');
      } else {
        showAlert('Error', data.error, 'error');
      }
    } catch (err) {
      showAlert('Error', err.message, 'error');
    }
    setIsLoading(false);
  };

  const downloadJSON = () => {
    const blob = new Blob([exportResult.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const downloadCSV = () => {
    const blob = new Blob([exportResult.csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const exampleQueries = [
    { name: 'SELECT ALL', sql: 'SELECT * FROM users LIMIT 10;' },
    { name: 'INSERT', sql: "INSERT INTO users (name, email) VALUES ('New User', 'user@mail.com');" },
    { name: 'UPDATE', sql: "UPDATE users SET name = 'Updated Name' WHERE id = 1;" },
    { name: 'DELETE', sql: 'DELETE FROM users WHERE id = 1;' },
    { name: 'COUNT', sql: 'SELECT COUNT(*) as total FROM users;' },
    { name: 'CREATE TABLE', sql: 'CREATE TABLE test_table (id SERIAL, name VARCHAR(100));' },
    { name: 'DROP TABLE', sql: 'DROP TABLE test_table;' },
  ];

  return (
    <div style={{
      background: '#0d1117',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #2c3e50'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#f39c12', fontSize: '18px' }}>SQL TERMINAL</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: showSaved ? '#e74c3c' : '#2c3e50', color: '#f39c12', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>SAVED ({savedQueries.length})</button>
          <button onClick={() => setShowHistory(!showHistory)} style={{ background: showHistory ? '#e74c3c' : '#2c3e50', color: '#f39c12', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>HISTORY ({queryHistory.length})</button>
          <button onClick={() => setShowSystem(!showSystem)} style={{ background: '#2c3e50', color: '#9b59b6', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>SYSTEM</button>
          <button onClick={saveCurrentQuery} style={{ background: '#2c3e50', color: '#2ecc71', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>SAVE</button>
          <button onClick={handleExport} disabled={isLoading} style={{ background: '#2c3e50', color: '#3498db', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>EXPORT</button>
          <div style={{ fontSize: '10px', color: '#2ecc71', fontFamily: 'monospace' }}>POSTGRESQL</div>
        </div>
      </div>

      {/* System Info Panel */}
      {showSystem && systemInfo && (
        <div style={{ marginBottom: '15px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #9b59b6', padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div><span style={{ color: '#f39c12' }}>Version:</span> <span style={{ color: '#2ecc71' }}>{systemInfo.version}</span></div>
            <div><span style={{ color: '#f39c12' }}>Tables:</span> <span style={{ color: '#2ecc71' }}>{systemInfo.tableCount}</span></div>
            <div><span style={{ color: '#f39c12' }}>DB Size:</span> <span style={{ color: '#2ecc71' }}>{systemInfo.dbSize}</span></div>
            <div><span style={{ color: '#f39c12' }}>Status:</span> <span style={{ color: '#2ecc71' }}>{systemInfo.status}</span></div>
          </div>
        </div>
      )}

      {/* Saved Queries Panel */}
      {showSaved && (
        <div style={{ marginBottom: '15px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #2c3e50', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
          <div style={{ color: '#f39c12', fontSize: '11px', marginBottom: '8px' }}>SAVED QUERIES</div>
          {savedQueries.length === 0 ? (
            <div style={{ color: '#7f8c8d', fontSize: '11px', textAlign: 'center', padding: '20px' }}>No saved queries. Click SAVE to save current query</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {savedQueries.map(q => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1a1a2e', padding: '4px 8px', borderRadius: '4px' }}>
                  <button onClick={() => loadSavedQuery(q)} style={{ background: 'none', border: 'none', color: '#2ecc71', cursor: 'pointer', fontSize: '11px' }}>{q.name}</button>
                  <button onClick={() => deleteSavedQuery(q.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '11px' }}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div style={{ marginBottom: '15px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #2c3e50', maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #2c3e50' }}>
            <span style={{ color: '#f39c12', fontSize: '11px' }}>QUERY HISTORY</span>
            <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '10px' }}>CLEAR ALL</button>
          </div>
          {queryHistory.length === 0 ? (
            <div style={{ color: '#7f8c8d', fontSize: '11px', textAlign: 'center', padding: '20px' }}>No history yet. Execute some queries!</div>
          ) : (
            queryHistory.map((item, idx) => (
              <div key={item.id} onClick={() => setSql(item.sql)} style={{ padding: '8px 10px', borderBottom: '1px solid #2c3e50', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px', background: idx % 2 === 0 ? '#0d1117' : '#0a0a0f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: item.success ? '#2ecc71' : '#e74c3c' }}>{item.success ? 'OK' : 'ERR'} {item.timestamp}</span>
                </div>
                <div style={{ color: '#ecf0f1', wordBreak: 'break-all' }}>{item.sql.length > 100 ? item.sql.substring(0, 100) + '...' : item.sql}</div>
                {item.error && <div style={{ color: '#e74c3c', fontSize: '10px', marginTop: '5px' }}>Error: {item.error}</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Examples Shortcuts */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {exampleQueries.map((ex, idx) => (
          <button key={idx} onClick={() => setSql(ex.sql)} style={{ background: '#1a1a2e', border: '1px solid #2c3e50', borderRadius: '4px', padding: '4px 8px', color: '#7f8c8d', fontSize: '10px', cursor: 'pointer' }}>
            {ex.name}
          </button>
        ))}
      </div>

      {/* SQL Editor */}
      <textarea 
        rows="6" 
        value={sql} 
        onChange={e => setSql(e.target.value)}
        style={{
          width: '100%',
          fontFamily: 'Consolas, monospace',
          fontSize: '13px',
          padding: '12px',
          border: '2px solid #2c3e50',
          borderRadius: '8px',
          resize: 'vertical',
          marginBottom: '10px',
          background: '#0a0a0f',
          color: '#2ecc71',
          lineHeight: '1.5'
        }}
        placeholder="Write your SQL query here..."
      />
      
      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={executeQuery}
          disabled={isLoading}
          style={{
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '13px',
            opacity: isLoading ? 0.7 : 1,
            flex: 1
          }}
        >
          {isLoading ? 'EXECUTING...' : 'EXECUTE QUERY'}
        </button>
        <button 
          onClick={() => setSql('')}
          style={{
            padding: '12px 25px',
            background: '#2c3e50',
            color: '#ecf0f1',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          CLEAR
        </button>
      </div>

      {/* Result Panel */}
      {result && (
        <div style={{
          background: '#0a0a0f',
          borderRadius: '8px',
          border: `2px solid ${result.success ? '#2ecc71' : '#e74c3c'}`,
          overflow: 'auto',
          maxHeight: '350px'
        }}>
          <div style={{
            padding: '10px 15px',
            borderBottom: `1px solid ${result.success ? '#2ecc71' : '#e74c3c'}`,
            background: result.success ? '#2ecc7120' : '#e74c3c20',
            color: result.success ? '#2ecc71' : '#e74c3c',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>RESULT</span>
            <span>{result.success && result.data ? `${result.data.length} ROWS` : result.success ? 'EXECUTED' : 'ERROR'}</span>
          </div>
          <pre style={{
            margin: 0,
            padding: '15px',
            fontFamily: 'Consolas, monospace',
            fontSize: '12px',
            color: '#2ecc71',
            overflowX: 'auto'
          }}>
            {JSON.stringify(result.success ? (result.data || result.message) : result.error, null, 2)}
          </pre>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && exportResult && exportResult.success && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }} onClick={() => setShowExportModal(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            width: '450px',
            border: '2px solid #3498db'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '15px 20px',
              borderBottom: '1px solid #3498db',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ color: '#3498db', margin: 0 }}>EXPORT DATA</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#f39c12', marginBottom: '20px' }}>Exported {exportResult.count} records</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={downloadJSON} style={{ background: '#2ecc71', border: 'none', padding: '10px 25px', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>JSON</button>
                <button onClick={downloadCSV} style={{ background: '#3498db', border: 'none', padding: '10px 25px', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>CSV</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueryEditor;