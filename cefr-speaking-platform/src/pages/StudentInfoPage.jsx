import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentInfoPage({ onStart }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !surname.trim()) {
      setError('Both name and surname are required');
      return;
    }

    const student = onStart(name.trim(), surname.trim());
    
    // Store current student info in sessionStorage for exam page
    sessionStorage.setItem('currentStudent', JSON.stringify(student));
    
    navigate('/exam');
  };

  return (
    <div className="container">
      <div className="nav-header">
        <div className="logo">CEFR Speaking Test Platform</div>
      </div>

      <div style={{ maxWidth: '500px', margin: '60px auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '32px', textAlign: 'center' }}>
          Student Information
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
              First Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your first name"
              style={{ marginBottom: '20px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Surname *
            </label>
            <input
              type="text"
              className="input-field"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Enter your surname"
              style={{ marginBottom: '24px' }}
            />
          </div>

          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Please enter your full name correctly. This information will be used to 
            identify your recordings and results. Your teacher will use this information 
            to find and evaluate your test.
          </p>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            style={{ fontSize: '16px' }}
          >
            Begin Speaking Test
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
      </div>
    </div>
  );
}

export default StudentInfoPage;
