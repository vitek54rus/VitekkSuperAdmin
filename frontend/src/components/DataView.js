import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function DataView(props) {
  const currentDatabase = props.dbName;
  const currentTableName = props.table;
  const showAlert = props.showAlert;
  
  const [allRecords, setAllRecords] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddWindow, setShowAddWindow] = useState(false);
  const [showEditWindow, setShowEditWindow] = useState(false);
  const [showDeleteWindow, setShowDeleteWindow] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (currentDatabase && currentTableName) {
      loadData();
      loadColumns();
    } else {
      setAllRecords([]);
      setAllColumns([]);
    }
  }, [currentDatabase, currentTableName]);

  const loadData = async () => {
    if (!currentDatabase || !currentTableName) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${API_BASE}/${currentDatabase}/data/${currentTableName}`);
      const recordsList = response.data.records || [];
      setAllRecords(recordsList);
      
      if (recordsList.length > 0 && allColumns.length === 0) {
        setAllColumns(Object.keys(recordsList[0]));
      }
    } catch (err) {
      console.error('Load error:', err);
      setErrorMessage(err.response?.data?.detail || err.message);
      setAllRecords([]);
    }
    setIsLoading(false);
  };

  const loadColumns = async () => {
    if (!currentDatabase || !currentTableName) return;
    
    try {
      const response = await axios.get(`${API_BASE}/${currentDatabase}/tables/${currentTableName}/columns`);
      const columnsInfo = response.data.columns || [];
      if (columnsInfo.length > 0) {
        setAllColumns(columnsInfo.map(col => col.name));
      }
    } catch (err) {
      if (allRecords.length > 0) {
        setAllColumns(Object.keys(allRecords[0]));
      }
    }
  };

  const addNewRecord = async () => {
    const { id, ...cleanData } = formValues;
    
    let hasData = false;
    for (let key in cleanData) {
      if (cleanData[key] && cleanData[key].toString().trim() !== '') {
        hasData = true;
        break;
      }
    }
    
    if (!hasData) {
      showAlert('Warning', 'Fill at least one field', 'warning');
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/${currentDatabase}/data/${currentTableName}`, { data: cleanData });
      await loadData();
      setFormValues({});
      setShowAddWindow(false);
      showAlert('Success', 'Record added', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const duplicateExistingRecord = async (record) => {
    const { id, ...recordWithoutId } = record;
    try {
      await axios.post(`${API_BASE}/${currentDatabase}/data/${currentTableName}`, { data: recordWithoutId });
      await loadData();
      showAlert('Success', 'Record duplicated', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const updateExistingRecord = async () => {
    const { id, ...updateData } = formValues;
    try {
      await axios.put(`${API_BASE}/${currentDatabase}/data/${currentTableName}/${editingRecordId}`, { data: updateData });
      await loadData();
      setFormValues({});
      setEditingRecordId(null);
      setShowEditWindow(false);
      showAlert('Success', 'Record updated', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const deleteExistingRecord = async () => {
    try {
      await axios.delete(`${API_BASE}/${currentDatabase}/data/${currentTableName}/${recordIdToDelete}`);
      await loadData();
      setShowDeleteWindow(false);
      setRecordIdToDelete(null);
      showAlert('Success', 'Record deleted', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const openAddWindow = () => {
    const emptyForm = {};
    allColumns.forEach(col => {
      if (col !== 'id') emptyForm[col] = '';
    });
    setFormValues(emptyForm);
    setShowAddWindow(true);
  };

  const openEditWindow = (record) => {
    setEditingRecordId(record.id);
    setFormValues(record);
    setShowEditWindow(true);
  };

  const openDeleteWindow = (recordId) => {
    setRecordIdToDelete(recordId);
    setShowDeleteWindow(true);
  };

  if (!currentDatabase) {
    return (
      <div style={{
        background: '#0d1117',
        borderRadius: '12px',
        padding: '60px',
        textAlign: 'center',
        color: '#7f8c8d',
        border: '1px solid #2c3e50'
      }}>
        Select a database first
      </div>
    );
  }

  if (!currentTableName) {
    return (
      <div style={{
        background: '#0d1117',
        borderRadius: '12px',
        padding: '60px',
        textAlign: 'center',
        color: '#7f8c8d',
        border: '1px solid #2c3e50'
      }}>
        Select a table from left
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: '#0d1117',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #2c3e50'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#f39c12' }}>TABLE: {currentTableName}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '12px' }}>
              {allRecords.length} RECORDS / {allColumns.length} COLUMNS
            </p>
          </div>
          <button 
            onClick={openAddWindow}
            style={{
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            ADD RECORD
          </button>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#f39c12' }}>LOADING...</div>
        ) : errorMessage ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
            ERROR: {errorMessage}
            <button onClick={loadData} style={{ marginLeft: '10px', background: '#2c3e50', border: 'none', padding: '5px 10px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>RETRY</button>
          </div>
        ) : allRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            NO DATA<br/>
            <button onClick={openAddWindow} style={{ marginTop: '10px', background: '#2ecc71', border: 'none', padding: '8px 16px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>ADD RECORD</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1a2e', borderBottom: '2px solid #e74c3c' }}>
                  {allColumns.map(col => (
                    <th key={col} style={{ padding: '12px', textAlign: 'left', color: '#f39c12' }}>{col}</th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'center', color: '#f39c12' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((record, idx) => (
                  <tr key={record.id} style={{ background: idx % 2 === 0 ? '#0a0a0f' : '#0d1117', borderBottom: '1px solid #2c3e50' }}>
                    {allColumns.map(col => (
                      <td key={col} style={{ padding: '10px', color: '#ecf0f1' }}>
                        {String(record[col] || 'NULL')}
                      </td>
                    ))}
                    <td style={{ padding: '5px', textAlign: 'center' }}>
                      <button onClick={() => openEditWindow(record)} style={{ background: '#f39c12', color: '#1a1a2e', border: 'none', borderRadius: '4px', padding: '4px 10px', marginRight: '5px', cursor: 'pointer' }}>EDIT</button>
                      <button onClick={() => duplicateExistingRecord(record)} style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', marginRight: '5px', cursor: 'pointer' }}>COPY</button>
                      <button onClick={() => openDeleteWindow(record.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}>DEL</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ADD RECORD */}
      {showAddWindow && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddWindow(false)}>
          <div style={{ background: '#1a1a2e', borderRadius: '12px', width: '450px', maxWidth: '90%', border: '2px solid #2ecc71' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px', borderBottom: '1px solid #2ecc71', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#2ecc71', margin: 0 }}>ADD NEW RECORD</h3>
              <button onClick={() => setShowAddWindow(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {allColumns.filter(col => col !== 'id').map(col => (
                <div key={col} style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#f39c12', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{col}</label>
                  <input
                    type="text"
                    value={formValues[col] || ''}
                    onChange={e => setFormValues({...formValues, [col]: e.target.value})}
                    placeholder={`Enter ${col}`}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddWindow(false)} style={{ padding: '8px 20px', background: '#2c3e50', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={addNewRecord} style={{ padding: '8px 20px', background: '#2ecc71', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>ADD</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT RECORD */}
      {showEditWindow && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowEditWindow(false)}>
          <div style={{ background: '#1a1a2e', borderRadius: '12px', width: '450px', maxWidth: '90%', border: '2px solid #f39c12' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px', borderBottom: '1px solid #f39c12', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#f39c12', margin: 0 }}>EDIT RECORD</h3>
              <button onClick={() => setShowEditWindow(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {allColumns.filter(col => col !== 'id').map(col => (
                <div key={col} style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#f39c12', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{col}</label>
                  <input
                    type="text"
                    value={formValues[col] || ''}
                    onChange={e => setFormValues({...formValues, [col]: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditWindow(false)} style={{ padding: '8px 20px', background: '#2c3e50', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={updateExistingRecord} style={{ padding: '8px 20px', background: '#f39c12', border: 'none', borderRadius: '4px', color: '#1a1a2e', cursor: 'pointer', fontWeight: 'bold' }}>UPDATE</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE RECORD */}
      {showDeleteWindow && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDeleteWindow(false)}>
          <div style={{ background: '#1a1a2e', borderRadius: '12px', width: '400px', border: '2px solid #e74c3c' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '15px', borderBottom: '1px solid #e74c3c' }}>
              <h3 style={{ color: '#e74c3c', margin: 0 }}>DELETE RECORD</h3>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#e74c3c' }}>Delete this record? ID: {recordIdToDelete}</p>
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteWindow(false)} style={{ padding: '8px 20px', background: '#2c3e50', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={deleteExistingRecord} style={{ padding: '8px 20px', background: '#e74c3c', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>DELETE</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DataView;