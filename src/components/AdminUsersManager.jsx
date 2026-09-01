import React, { useState } from 'react';
import { UserPlus, Users, Trash2, ShieldCheck, Mail, Key, User, PlusCircle, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminUsersManager() {
  const { adminUsers, addAdminUser, deleteAdminUser, currentAdmin } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'Dispatcher'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = addAdminUser(formData);
    if (res.success) {
      setSuccess(`Admin account "${formData.username}" created successfully.`);
      setFormData({ username: '', password: '', fullName: '', email: '', role: 'Dispatcher' });
      setShowAddForm(false);
    } else {
      setError(res.error);
    }
  };

  const handleDelete = (username) => {
    if (confirm(`Are you sure you want to revoke admin access for "${username}"?`)) {
      const res = deleteAdminUser(username);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} color="var(--primary-cyan)" />
            <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary-navy)' }}>
              Admin Accounts & Access Management
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Manage authorized staff accounts, dispatchers, and system operators.
          </p>
        </div>

        <button className="btn-cyan" onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus size={18} /> {showAddForm ? 'Close Form' : 'Add New Admin'}
        </button>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <Check size={18} /> {success}
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="glass-card" style={{ padding: '24px', background: '#F8FAFC', border: '1px solid var(--primary-cyan)' }}>
          <h4 style={{ color: 'var(--primary-navy)', marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} color="var(--primary-cyan)" /> Register New Admin Account
          </h4>

          {error && (
            <div style={{ background: '#FFF1F2', color: '#9F1239', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Username *</label>
                <input type="text" required className="glass-input" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="e.g. jsmith" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Password *</label>
                <input type="password" required className="glass-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Secure password" />
              </div>
            </div>

            <div className="grid-3">
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" required className="glass-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g. John Smith" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" required className="glass-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jsmith@shippulse.com" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '4px' }}>Role / Designation</label>
                <select className="glass-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Customs Inspector">Customs Inspector</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Admin User Account</button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>User</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(user => {
              const isSelf = currentAdmin?.username?.toLowerCase() === user.username.toLowerCase();
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{user.fullName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{user.username}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-transit">{user.role}</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{user.createdAt || 'Active'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {isSelf ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>Active Session</span>
                    ) : (
                      <button 
                        onClick={() => handleDelete(user.username)}
                        className="btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={13} /> Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
