import React, { useState, useEffect } from 'react';

export default function ConnectionManager() {
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3002/api/connections')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setConnections(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    alert('Copied to clipboard!');
  };

  if (loading) return <div style={{ color: 'white', padding: 20 }}>Loading connections...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: 20 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10, background: 'linear-gradient(to right, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Connection Manager
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: 30 }}>
        Manage your local and online connections to the Studio Brain.
      </p>

      {connections && Object.entries(connections).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 15, fontWeight: 700 }}>
            {category.replace('_', ' ')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {items.map((item, index) => (
              <div key={index} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                padding: 20,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                {/* Glowing edge based on type */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                  background: item.type === 'IP' ? '#10b981' : 
                              item.type === 'WIFI' ? '#3b82f6' : 
                              item.type === 'BLUETOOTH' ? '#8b5cf6' : 
                              item.type === 'TUNNEL' ? '#f59e0b' : 
                              item.type === 'EVO' ? '#ec4899' : '#64748b'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{item.name}</h3>
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)', color: '#94a3b8'
                  }}>
                    {item.type}
                  </span>
                </div>
                
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 15 }}>{item.description}</p>
                
                {item.url && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text" 
                      value={item.url} 
                      readOnly 
                      style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: '6px 10px', color: '#cbd5e1', fontSize: 12, outline: 'none' }}
                    />
                    <button 
                      onClick={() => handleCopy(item.url)}
                      style={{ background: '#facc15', color: 'black', border: 'none', borderRadius: 6, padding: '0 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
