import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Таблицы
export const getTables = () => api.get('/tables/');
export const getTableColumns = (tableName) => api.get(`/tables/${tableName}/columns`);
export const createTable = (name, columns) => api.post('/tables/', { name, columns });
export const dropTable = (table) => api.delete(`/tables/${table}`);

// Данные
export const getData = (table) => api.get(`/data/${table}`);
export const insertRow = (table, data) => api.post(`/data/${table}`, { table, data });
export const updateRow = (table, id, data) => api.put(`/data/${table}/${id}`, { table, id, data });
export const deleteRow = (table, id) => api.delete(`/data/${table}/${id}`);

// Запросы
export const runQuery = (sql) => api.post('/query/', { sql });

// Система (опционально)
export const getSystemInfo = () => api.get('/system/info');

// Единый экспорт по умолчанию
export default api;