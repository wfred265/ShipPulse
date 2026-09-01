import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin({ onLoginSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(async () => {
      const res = await login(username, password);
      setLoading(false);
      if (res && res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(res?.error || 'Invalid username or password.');
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      padding: '24px 20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px 32px',
        boxShadow: '0 20px 40px rgba(11, 25, 44, 0.12)',
        border: '1px solid var(--border-color)'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img 
            src="/logo.png" 
            alt="ShipPulse Logo" 
            style={{ height: '56px', width: 'auto', marginBottom: '12px' }} 
          />
          <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '4px' }}>
            Admin Portal Access
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Enter your operational credentials to authenticate.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            color: '#9F1239',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} color="#E11D48" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '6px' }}>
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input 
                type="text" 
                required 
                className="glass-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter admin username..."
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input 
                type="password" 
                required 
                className="glass-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', minHeight: '48px', fontSize: '1rem', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : <>Authenticate & Access Dashboard <ArrowRight size={18} /></>}
          </button>
        </form>

      </div>
    </div>
  );
}
