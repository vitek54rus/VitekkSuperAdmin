import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getTables, dropTable, createTable } from '../api';
import CreateTableModal from './CreateTableModal';
import CustomModal from './CustomModal';

const TableList = forwardRef(({ onSelectTable, selectedTable, showAlert }, ref) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await getTables();
      setTables(res.data.tables || []);
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ loadTables }));

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreateTable = async (tableName, columnsSQL) => {
    try {
      await createTable(tableName, columnsSQL);
      await loadTables();
      showAlert('Success', `Table "${tableName}" created`, 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const handleDropTable = async (table) => {
    try {
      await dropTable(table);
      await loadTables();
      if (selectedTable === table) onSelectTable(null);
      setDeleteConfirm(null);
      showAlert('Success', `Table "${table}" deleted`, 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #2c3e50',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#f39c12', fontSize: '18px', fontWeight: '700' }}>DATA TABLES</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={loadTables}
              disabled={loading}
              style={{
                background: '#2c3e50',
                color: '#ecf0f1',
                border: '1px solid #f39c12',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              REFRESH
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              CREATE
            </button>
          </div>
        </div>
        
        {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#f39c12' }}>LOADING...</div>}
        
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {tables.map(t => (
            <div
              key={t}
              onClick={() => onSelectTable(t)}
              onContextMenu={(e) => {
                e.preventDefault();
                setDeleteConfirm(t);
              }}
              style={{
                padding: '12px',
                margin: '8px 0',
                background: selectedTable === t ? 'linear-gradient(135deg, #e74c3c20 0%, #c0392b20 100%)' : 'transparent',
                border: selectedTable === t ? '1px solid #e74c3c' : '1px solid #2c3e50',
                color: selectedTable === t ? '#f39c12' : '#ecf0f1',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'monospace'
              }}
            >
              <span>{t}</span>
              <span style={{ fontSize: '10px', color: '#7f8c8d' }}>RMB</span>
            </div>
          ))}
        </div>
        
        {tables.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            NO TABLES<br/>
            Click CREATE to start
          </div>
        )}
      </div>

      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTable={handleCreateTable}
        showAlert={showAlert}
      />

      <CustomModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="DELETE TABLE"
        onConfirm={() => handleDropTable(deleteConfirm)}
        type="danger"
        confirmText="DELETE"
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#e74c3c', fontSize: '16px', marginBottom: '10px' }}>
            Delete table "{deleteConfirm}"?
          </p>
          <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
            All data will be permanently deleted
          </p>
        </div>
      </CustomModal>
    </>
  );
});

export default TableList;