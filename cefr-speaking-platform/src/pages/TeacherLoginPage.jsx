import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TeacherLoginPage() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (accessCode === '1994') {
      sessionStorage.setItem('teacherAuthenticated', 'true');
      navigate('/teacher/dashboard');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="nav-header">
        <div className="logo">CEFR Speaking Test Platform</div>
      </div>

      <div style={{ maxWidth: '400px', margin: '60px auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '32px', textAlign: 'center' }}>
          Teacher Access
        </h1>

        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee', 
              border: '2px solid #f00',
              marginBottom: '16px',
              color: '#c00'
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Access Code
            </label>
            <input
              type="password"
              className="input-field"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                setError('');
              }}
              placeholder="Enter access code"
              style={{ marginBottom: '24px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            style={{ fontSize: '16px' }}
          >
            Access Dashboard
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            className="btn" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>

        <p style={{ 
          marginTop: '32px', 
          fontSize: '14px', 
          color: '#666',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          This area is restricted to authorized teachers only. 
          Enter your access code to view student evaluations.
        </p>
      </div>
    </div>
  );
}

export default TeacherLoginPage;
