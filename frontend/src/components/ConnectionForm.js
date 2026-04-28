import React, { useState } from 'react';

function ConnectionForm({ onConnect }) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('postgres');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');

  const connect = () => {
    const url = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    localStorage.setItem('db_url', url);
    onConnect();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(243,156,18,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(243,156,18,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(15,15,26,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '40px',
        width: '450px',
        border: '1px solid rgba(243,156,18,0.3)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '50px' }}>DB</div>
          <h2 style={{ color: '#f39c12', marginTop: '10px', fontWeight: '700', letterSpacing: '2px' }}>DATABASE ACCESS</h2>
          <p style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '5px' }}>AUTHORIZED ACCESS ONLY</p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e74c3c', fontWeight: '600', fontSize: '12px', letterSpacing: '1px' }}>HOST</label>
          <input 
            value={host} 
            onChange={e => setHost(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e74c3c', fontWeight: '600', fontSize: '12px', letterSpacing: '1px' }}>PORT</label>
          <input 
            value={port} 
            onChange={e => setPort(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e74c3c', fontWeight: '600', fontSize: '12px', letterSpacing: '1px' }}>DATABASE</label>
          <input 
            value={database} 
            onChange={e => setDatabase(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e74c3c', fontWeight: '600', fontSize: '12px', letterSpacing: '1px' }}>USERNAME</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e74c3c', fontWeight: '600', fontSize: '12px', letterSpacing: '1px' }}>PASSWORD</label>
          <input 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2c3e50', background: '#0d1117', color: '#ecf0f1', fontSize: '14px' }}
          />
        </div>
        
        <button 
          onClick={connect}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 4px 15px rgba(231,76,60,0.3)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'scale(1.02)';
            e.target.style.boxShadow = '0 6px 20px rgba(231,76,60,0.5)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(231,76,60,0.3)';
          }}
        >
          CONNECT
        </button>
      </div>
    </div>
  );
}

export default ConnectionForm;