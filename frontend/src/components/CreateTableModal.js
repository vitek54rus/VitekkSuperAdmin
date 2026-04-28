import React, { useState } from 'react';
import CustomModal from './CustomModal';

function CreateTableModal({ isOpen, onClose, onCreateTable, showAlert }) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { name: 'name', type: 'VARCHAR(255)' }
  ]);

  const columnTypes = [
    'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(255)', 'VARCHAR(500)',
    'TEXT', 'INT', 'BIGINT', 'SMALLINT',
    'DECIMAL(10,2)', 'FLOAT', 'BOOLEAN', 'DATE',
    'TIMESTAMP', 'TIME', 'JSON', 'UUID'
  ];

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'VARCHAR(255)' }]);
  };

  const removeColumn = (index) => {
    if (columns.length === 1) {
      showAlert('Warning', 'Table must have at least one column', 'warning');
      return;
    }
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
  };

  const updateColumnName = (index, value) => {
    const newColumns = [...columns];
    newColumns[index].name = value;
    setColumns(newColumns);
  };

  const updateColumnType = (index, value) => {
    const newColumns = [...columns];
    newColumns[index].type = value;
    setColumns(newColumns);
  };

  const generateSQL = () => {
    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) return 'name VARCHAR(255)';
    const columnDefs = validColumns.map(col => `${col.name} ${col.type}`);
    return columnDefs.join(', ');
  };

  const handleCreate = () => {
    if (!tableName.trim()) {
      showAlert('Error', 'Enter table name', 'error');
      return;
    }
    
    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) {
      showAlert('Error', 'Add at least one column', 'error');
      return;
    }
    
    const columnNames = validColumns.map(col => col.name.toLowerCase());
    const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      showAlert('Error', `Duplicate column names: ${duplicates.join(', ')}`, 'error');
      return;
    }
    
    const sqlColumns = generateSQL();
    onCreateTable(tableName, sqlColumns);
    setTableName('');
    setColumns([{ name: 'name', type: 'VARCHAR(255)' }]);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="CREATE NEW TABLE"
      onConfirm={handleCreate}
      type="warning"
      confirmText="CREATE"
    >
      <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
        {/* Table Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#f39c12', fontWeight: 'bold', fontSize: '12px' }}>
            TABLE NAME:
          </label>
          <input
            type="text"
            value={tableName}
            onChange={e => setTableName(e.target.value)}
            placeholder="example: users, products, orders"
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
          />
        </div>

        {/* Columns */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#f39c12', fontWeight: 'bold', fontSize: '12px' }}>
            COLUMNS:
          </label>
          
          {columns.map((col, index) => (
            <div key={index} style={{ 
              marginBottom: '8px', 
              padding: '10px',
              background: '#0a0a0f',
              borderRadius: '6px',
              border: '1px solid #2c3e50'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '120px' }}>
                  <input
                    type="text"
                    value={col.name}
                    onChange={e => updateColumnName(index, e.target.value)}
                    placeholder="column name"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #2c3e50',
                      background: '#0d1117',
                      color: '#ecf0f1',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                
                <div style={{ flex: 2, minWidth: '140px' }}>
                  <select
                    value={col.type}
                    onChange={e => updateColumnType(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #f39c12',
                      background: '#0d1117',
                      color: '#f39c12',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {columnTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => removeColumn(index)}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Remove column"
                >
                  X
                </button>
              </div>
              <div style={{ fontSize: '9px', color: '#7f8c8d', marginTop: '5px' }}>
                {col.type.includes('VARCHAR') && 'Text field - stores string values'}
                {col.type === 'INT' && 'Integer number - whole numbers only'}
                {col.type === 'BIGINT' && 'Large integer - for big numbers'}
                {col.type === 'DECIMAL(10,2)' && 'Decimal number - for prices, coordinates'}
                {col.type === 'DATE' && 'Date format: YYYY-MM-DD'}
                {col.type === 'TIMESTAMP' && 'Date and time: YYYY-MM-DD HH:MM:SS'}
                {col.type === 'BOOLEAN' && 'True/False value'}
                {col.type === 'TEXT' && 'Long text - for descriptions, articles'}
                {col.type === 'JSON' && 'JSON data - stores objects'}
              </div>
            </div>
          ))}
          
          <button
            onClick={addColumn}
            style={{
              width: '100%',
              padding: '8px',
              background: '#2c3e50',
              color: '#f39c12',
              border: '1px dashed #f39c12',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            + ADD COLUMN
          </button>
        </div>

        {/* SQL Preview */}
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#0a0a0f',
          borderRadius: '6px',
          border: '1px solid #2c3e50'
        }}>
          <div style={{ color: '#f39c12', fontSize: '10px', marginBottom: '5px', fontWeight: 'bold' }}>
            SQL PREVIEW:
          </div>
          <pre style={{ 
            margin: 0, 
            color: '#2ecc71', 
            fontSize: '10px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            CREATE TABLE {tableName || 'table_name'} (
              id SERIAL PRIMARY KEY,
              {generateSQL()}
            );
          </pre>
        </div>

        {/* Type Guide */}
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#1a1a2e',
          borderRadius: '6px',
          border: '1px solid #2c3e50'
        }}>
          <div style={{ color: '#f39c12', fontSize: '10px', marginBottom: '5px' }}>DATA TYPE GUIDE:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '9px', color: '#7f8c8d' }}>
            <div>VARCHAR(255) - Text (255 chars)</div>
            <div>INT - Whole numbers</div>
            <div>TEXT - Long text</div>
            <div>DECIMAL - Numbers with decimals</div>
            <div>DATE - Date (YYYY-MM-DD)</div>
            <div>TIMESTAMP - Date and time</div>
            <div>BOOLEAN - True/False</div>
            <div>JSON - JSON objects</div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}

export default CreateTableModal;