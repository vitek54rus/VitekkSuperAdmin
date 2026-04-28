import React, { useEffect, useState } from 'react';
import { getData, insertRow, updateRow, deleteRow, getTableColumns } from '../api';
import CustomModal from './CustomModal';

function DataView({ table: currentTable, showAlert }) {
  const [allRecords, setAllRecords] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpenBulkDelete, setIsModalOpenBulkDelete] = useState(false);

  useEffect(() => {
    if (currentTable) {
      loadRecords();
      loadStructure();
      setSelectedRows([]);
    }
  }, [currentTable]);

  const loadRecords = async () => {
    setIsLoadingData(true);
    setErrorMessage(null);
    try {
      const response = await getData(currentTable);
      const recordsList = response.data.records || [];
      setAllRecords(recordsList);
      if (recordsList.length > 0 && allColumns.length === 0) {
        setAllColumns(Object.keys(recordsList[0]));
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || err.message);
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
    setIsLoadingData(false);
  };

  const loadStructure = async () => {
    try {
      const response = await getTableColumns(currentTable);
      const columnsInfo = response.data.columns || [];
      const columnNamesOnly = columnsInfo.map(col => col.name);
      setAllColumns(columnNamesOnly);
    } catch (err) {
      if (allRecords.length > 0) {
        setAllColumns(Object.keys(allRecords[0]));
      }
    }
  };

  const handleAddRecord = async () => {
    const { id, ...cleanData } = formData;
    
    const hasData = Object.values(cleanData).some(val => val && val.toString().trim() !== '');
    if (!hasData) {
      showAlert('Warning', 'Fill at least one field', 'warning');
      return;
    }
    
    try {
      await insertRow(currentTable, cleanData);
      await loadRecords();
      setFormData({});
      setIsModalOpenAdd(false);
      showAlert('Success', 'Record added successfully', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const handleDuplicateRecord = async (record) => {
    const { id, ...recordWithoutId } = record;
    try {
      await insertRow(currentTable, recordWithoutId);
      await loadRecords();
      showAlert('Success', 'Record duplicated', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const handleEditRecord = async () => {
    try {
      const { id, ...updateData } = formData;
      await updateRow(currentTable, editingRecordId, updateData);
      await loadRecords();
      setFormData({});
      setEditingRecordId(null);
      setIsModalOpenEdit(false);
      showAlert('Success', 'Record updated', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const handleDeleteRecord = async () => {
    try {
      await deleteRow(currentTable, recordToDelete);
      await loadRecords();
      setIsModalOpenDelete(false);
      setRecordToDelete(null);
      showAlert('Success', 'Record deleted', 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedRows) {
        await deleteRow(currentTable, id);
      }
      await loadRecords();
      setSelectedRows([]);
      setIsModalOpenBulkDelete(false);
      showAlert('Success', `Deleted ${selectedRows.length} records`, 'success');
    } catch (err) {
      showAlert('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const toggleRowSelection = (recordId) => {
    if (selectedRows.includes(recordId)) {
      setSelectedRows(selectedRows.filter(id => id !== recordId));
    } else {
      setSelectedRows([...selectedRows, recordId]);
    }
  };

  const selectAllRows = () => {
    if (selectedRows.length === allRecords.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allRecords.map(r => r.id));
    }
  };

  const openAddModal = () => {
    const emptyForm = {};
    allColumns.forEach(col => {
      if (col !== 'id') emptyForm[col] = '';
    });
    setFormData(emptyForm);
    setIsModalOpenAdd(true);
  };

  const openEditModal = (record) => {
    setEditingRecordId(record.id);
    setFormData(record);
    setIsModalOpenEdit(true);
  };

  const openDeleteModal = (recordId) => {
    setRecordToDelete(recordId);
    setIsModalOpenDelete(true);
  };

  if (!currentTable) {
    return (
      <div style={{
        background: '#0d1117',
        borderRadius: '12px',
        padding: '60px',
        textAlign: 'center',
        color: '#7f8c8d',
        border: '1px solid #2c3e50'
      }}>
        SELECT A TABLE FROM LEFT
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#f39c12', fontSize: '18px' }}>
              TABLE: {currentTable}
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '12px', fontFamily: 'monospace' }}>
              {allRecords.length} RECORDS / {allColumns.length} COLUMNS
              {selectedRows.length > 0 && ` / ${selectedRows.length} SELECTED`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={openAddModal}
              style={{
                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '12px'
              }}
            >
              ADD RECORD
            </button>

            {selectedRows.length > 0 && (
              <button 
                onClick={() => setIsModalOpenBulkDelete(true)}
                style={{
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '12px'
                }}
              >
                DELETE {selectedRows.length}
              </button>
            )}
          </div>
        </div>
        
        {/* Table */}
        {isLoadingData ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#f39c12' }}>LOADING DATA...</div>
        ) : errorMessage ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
            ERROR: {errorMessage}
            <button onClick={loadRecords} style={{ marginLeft: '15px', background: '#2c3e50', border: 'none', padding: '5px 15px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>RETRY</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1a1a2e', borderBottom: '2px solid #e74c3c' }}>
                  <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={selectAllRows}
                      checked={selectedRows.length === allRecords.length && allRecords.length > 0}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  {allColumns.map((columnName) => (
                    <th key={columnName} style={{ padding: '12px', textAlign: 'left', color: '#f39c12' }}>{columnName}</th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'center', color: '#f39c12' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((singleRecord, indexPosition) => (
                  <tr 
                    key={singleRecord.id}
                    onDoubleClick={() => openEditModal(singleRecord)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (window.confirm(`Delete record ID: ${singleRecord.id}?`)) {
                        openDeleteModal(singleRecord.id);
                      }
                    }}
                    style={{ 
                      background: selectedRows.includes(singleRecord.id) ? '#e74c3c30' : (indexPosition % 2 === 0 ? '#0a0a0f' : '#0d1117'),
                      borderBottom: '1px solid #2c3e50',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(singleRecord.id)}
                        onChange={() => toggleRowSelection(singleRecord.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    {allColumns.map((columnName) => (
                      <td key={columnName} style={{ padding: '10px', color: '#ecf0f1' }}>
                        {String(singleRecord[columnName] || 'NULL')}
                      </td>
                    ))}
                    <td style={{ padding: '5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => openEditModal(singleRecord)}
                        style={{ 
                          background: '#f39c12',
                          color: '#1a1a2e',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          marginRight: '5px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => handleDuplicateRecord(singleRecord)}
                        style={{ 
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          marginRight: '5px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                        title="Duplicate record"
                      >
                        COPY
                      </button>
                      <button 
                        onClick={() => openDeleteModal(singleRecord.id)}
                        style={{ 
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        DEL
                      </button>
                    </td>
                  </tr>
                ))}
                
                {allRecords.length === 0 && (
                  <tr>
                    <td colSpan={allColumns.length + 2} style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                      NO DATA - Click ADD RECORD to add first record
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD RECORD */}
      <CustomModal
        isOpen={isModalOpenAdd}
        onClose={() => setIsModalOpenAdd(false)}
        title="ADD NEW RECORD"
        onConfirm={handleAddRecord}
        type="success"
        confirmText="ADD"
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {allColumns.filter(col => col !== 'id').map((columnName) => (
            <div key={columnName} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#f39c12', fontWeight: 'bold', fontSize: '12px' }}>
                {columnName}:
              </label>
              <input
                type="text"
                value={formData[columnName] || ''}
                onChange={(e) => setFormData({...formData, [columnName]: e.target.value})}
                placeholder={`Enter ${columnName}`}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #2c3e50',
                  background: '#0d1117',
                  color: '#ecf0f1',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecord();
                  }
                }}
              />
            </div>
          ))}
        </div>
      </CustomModal>

      {/* MODAL: EDIT RECORD */}
      <CustomModal
        isOpen={isModalOpenEdit}
        onClose={() => {
          setIsModalOpenEdit(false);
          setFormData({});
          setEditingRecordId(null);
        }}
        title="EDIT RECORD"
        onConfirm={handleEditRecord}
        type="warning"
        confirmText="UPDATE"
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {allColumns.filter(col => col !== 'id').map((columnName) => (
            <div key={columnName} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#f39c12', fontWeight: 'bold', fontSize: '12px' }}>
                {columnName}:
              </label>
              <input
                type="text"
                value={formData[columnName] || ''}
                onChange={(e) => setFormData({...formData, [columnName]: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #2c3e50',
                  background: '#0d1117',
                  color: '#ecf0f1',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditRecord();
                  }
                }}
              />
            </div>
          ))}
        </div>
      </CustomModal>

      {/* MODAL: DELETE SINGLE */}
      <CustomModal
        isOpen={isModalOpenDelete}
        onClose={() => setIsModalOpenDelete(false)}
        title="DELETE RECORD"
        onConfirm={handleDeleteRecord}
        type="danger"
        confirmText="DELETE"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#e74c3c', fontSize: '16px', marginBottom: '10px' }}>
            Delete this record?
          </p>
          <p style={{ color: '#f39c12', fontSize: '12px' }}>
            ID: {recordToDelete}
          </p>
          <p style={{ color: '#7f8c8d', fontSize: '11px', marginTop: '10px' }}>
            This action cannot be undone
          </p>
        </div>
      </CustomModal>

      {/* MODAL: BULK DELETE */}
      <CustomModal
        isOpen={isModalOpenBulkDelete}
        onClose={() => setIsModalOpenBulkDelete(false)}
        title="BULK DELETE"
        onConfirm={handleBulkDelete}
        type="danger"
        confirmText="DELETE ALL"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#e74c3c', fontSize: '16px', marginBottom: '10px' }}>
            Delete {selectedRows.length} records?
          </p>
          <p style={{ color: '#f39c12', fontSize: '12px' }}>
            Selected records: {selectedRows.length}
          </p>
          <p style={{ color: '#7f8c8d', fontSize: '11px', marginTop: '10px' }}>
            This action cannot be undone
          </p>
        </div>
      </CustomModal>
    </>
  );
}

export default DataView;