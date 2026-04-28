import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function QueryEditor({ dbName, showAlert }) {
  const [sql, setSql] = useState('SELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [savedQueries, setSavedQueries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vitekk_saved_queries');
    if (saved) setSavedQueries(JSON.parse(saved));
    const history = localStorage.getItem('vitekk_query_history');
    if (history) setQueryHistory(JSON.parse(history));
  }, []);

  const executeQuery = async () => {
    if (!dbName) {
      showAlert('Warning', 'Select a database first', 'warning');
      return;
    }
    if (!sql.trim()) {
      showAlert('Warning', 'Enter SQL query', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/${dbName}/query`, { sql });
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

  // СОХРАНЕНИЕ ЗАПРОСА
  const saveCurrentQuery = () => {
    if (!sql.trim()) {
      showAlert('Warning', 'Write a query first before saving', 'warning');
      return;
    }
    const queryName = prompt('Enter query name:', `Query ${savedQueries.length + 1}`);
    if (!queryName) return;
    
    // Проверка на дубликат имени
    const existing = savedQueries.find(q => q.name === queryName);
    if (existing) {
      showAlert('Warning', 'Query with this name already exists', 'warning');
      return;
    }
    
    const newSaved = [...savedQueries, {
      id: Date.now(),
      name: queryName,
      sql: sql,
      date: new Date().toLocaleString()
    }];
    setSavedQueries(newSaved);
    localStorage.setItem('vitekk_saved_queries', JSON.stringify(newSaved));
    showAlert('Success', `Query "${queryName}" saved`, 'success');
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

  // ЭКСПОРТ
  const handleExport = async () => {
    if (!dbName) {
      showAlert('Warning', 'Select a database first', 'warning');
      return;
    }
    if (!sql.trim()) {
      showAlert('Warning', 'Write a SELECT query to export', 'warning');
      return;
    }
    
    const sqlUpper = sql.toUpperCase().trim();
    if (!sqlUpper.startsWith('SELECT')) {
      showAlert('Warning', 'Only SELECT queries can be exported. Write a SELECT query first.', 'warning');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/${dbName}/query`, { sql });
      const data = response.data;
      
      if (data.success && data.data && data.data.length > 0) {
        const jsonData = JSON.stringify(data.data, null, 2);
        
        let csvData = "";
        if (data.data.length > 0) {
          const headers = Object.keys(data.data[0]);
          csvData = headers.join(",") + "\n";
          for (const row of data.data) {
            const values = headers.map(h => {
              let val = row[h];
              if (val === null || val === undefined) val = "";
              return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvData += values.join(",") + "\n";
          }
        }
        
        setExportResult({
          json: jsonData,
          csv: csvData,
          count: data.data.length
        });
        setShowExportModal(true);
        showAlert('Success', `Exported ${data.data.length} records`, 'success');
      } else if (data.success && data.data && data.data.length === 0) {
        showAlert('Warning', 'Query returned no data to export', 'warning');
      } else {
        showAlert('Error', data.error || 'Failed to export data', 'error');
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

  if (!dbName) {
    return (
      <div style={{
        background: '#0d1117',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#7f8c8d',
        border: '1px solid #2c3e50'
      }}>
        SELECT A DATABASE TO USE SQL TERMINAL
      </div>
    );
  }

  return (
    <div style={{
      background: '#0d1117',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #2c3e50'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#f39c12', fontSize: '18px' }}>SQL TERMINAL - {dbName}</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: showSaved ? '#e74c3c' : '#2c3e50', color: '#f39c12', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>SAVED ({savedQueries.length})</button>
          <button onClick={() => setShowHistory(!showHistory)} style={{ background: showHistory ? '#e74c3c' : '#2c3e50', color: '#f39c12', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>HISTORY ({queryHistory.length})</button>
          <button onClick={saveCurrentQuery} style={{ background: '#2c3e50', color: '#2ecc71', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>SAVE</button>
          <button onClick={handleExport} disabled={isLoading} style={{ background: '#2c3e50', color: '#3498db', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>EXPORT</button>
        </div>
      </div>

      {showSaved && (
        <div style={{ marginBottom: '15px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #2c3e50', padding: '10px', maxHeight: '120px', overflowY: 'auto' }}>
          <div style={{ color: '#f39c12', fontSize: '11px', marginBottom: '8px' }}>SAVED QUERIES</div>
          {savedQueries.length === 0 ? (
            <div style={{ color: '#7f8c8d', fontSize: '11px', textAlign: 'center', padding: '10px' }}>No saved queries. Write a query and click SAVE</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {savedQueries.map(q => (
                <div key={q.id} style={{ background: '#1a1a2e', padding: '4px 8px', borderRadius: '4px' }}>
                  <button onClick={() => loadSavedQuery(q)} style={{ background: 'none', border: 'none', color: '#2ecc71', cursor: 'pointer' }}>{q.name}</button>
                  <button onClick={() => deleteSavedQuery(q.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <div style={{ marginBottom: '15px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #2c3e50', maxHeight: '150px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #2c3e50' }}>
            <span style={{ color: '#f39c12', fontSize: '11px' }}>QUERY HISTORY</span>
            <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '10px' }}>CLEAR</button>
          </div>
          {queryHistory.length === 0 ? (
            <div style={{ color: '#7f8c8d', fontSize: '11px', textAlign: 'center', padding: '20px' }}>No history yet. Execute some queries!</div>
          ) : (
            queryHistory.map((item, idx) => (
              <div key={item.id} onClick={() => setSql(item.sql)} style={{ padding: '6px 8px', borderBottom: '1px solid #2c3e50', cursor: 'pointer', background: idx % 2 === 0 ? '#0d1117' : '#0a0a0f' }}>
                <span style={{ color: item.success ? '#2ecc71' : '#e74c3c', fontSize: '10px' }}>{item.success ? 'OK' : 'ERR'}</span>
                <span style={{ color: '#7f8c8d', marginLeft: '8px', fontSize: '10px' }}>{item.timestamp}</span>
                <div style={{ color: '#ecf0f1', fontSize: '10px', marginTop: '3px' }}>{item.sql.substring(0, 60)}</div>
                {item.error && <div style={{ color: '#e74c3c', fontSize: '9px', marginTop: '3px' }}>Error: {item.error.substring(0, 50)}</div>}
              </div>
            ))
          )}
        </div>
      )}

      <textarea 
        rows="6" 
        value={sql} 
        onChange={e => setSql(e.target.value)}
        placeholder="Write your SQL query here... Example: SELECT * FROM users LIMIT 10;"
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
          color: '#2ecc71'
        }}
      />
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={executeQuery} disabled={isLoading} style={{ padding: '10px 25px', background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: '700', flex: 1 }}>{isLoading ? 'EXECUTING...' : 'EXECUTE QUERY'}</button>
        <button onClick={() => setSql('')} style={{ padding: '10px 20px', background: '#2c3e50', color: '#ecf0f1', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>CLEAR</button>
      </div>

      {result && (
        <div style={{
          background: '#0a0a0f',
          borderRadius: '8px',
          border: `2px solid ${result.success ? '#2ecc71' : '#e74c3c'}`,
          overflow: 'auto',
          maxHeight: '250px',
          minHeight: '80px'
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: `1px solid ${result.success ? '#2ecc71' : '#e74c3c'}`,
            background: result.success ? '#2ecc7120' : '#e74c3c20',
            color: result.success ? '#2ecc71' : '#e74c3c',
            fontSize: '11px'
          }}>
            RESULT {result.success && result.data && `(${result.data.length} rows)`}
          </div>
          <pre style={{
            margin: 0,
            padding: '10px',
            fontFamily: 'Consolas, monospace',
            fontSize: '11px',
            color: '#2ecc71',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '200px'
          }}>
            {JSON.stringify(result.success ? (result.data || result.message) : result.error, null, 2)}
          </pre>
        </div>
      )}

      {showExportModal && exportResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowExportModal(false)}>
          <div style={{ background: '#1a1a2e', borderRadius: '16px', width: '400px', border: '2px solid #3498db' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px', borderBottom: '1px solid #3498db', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#3498db', margin: 0 }}>EXPORT DATA</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#f39c12' }}>Exported {exportResult.count} records</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={downloadJSON} style={{ background: '#2ecc71', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>JSON</button>
                <button onClick={downloadCSV} style={{ background: '#3498db', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>CSV</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueryEditor;