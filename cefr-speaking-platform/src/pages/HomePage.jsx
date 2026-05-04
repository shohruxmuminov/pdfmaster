import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="nav-header">
        <div className="logo">CEFR Speaking Test Platform</div>
      </div>
      
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '24px' }}>Welcome to the CEFR Speaking Mock Test</h1>
        
        <p style={{ fontSize: '18px', marginBottom: '40px', lineHeight: '1.8' }}>
          This platform simulates a real CEFR speaking examination environment. 
          You will complete four parts designed to assess your speaking abilities 
          across different CEFR levels (A1 to C1).
        </p>

        <div className="card" style={{ textAlign: 'left' }}>
          <h2 className="card-title">Exam Structure</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <strong>Part 1.1 - Basic Questions (A1-A2)</strong>
            <p style={{ marginTop: '8px', color: '#666' }}>
              Answer 3 simple questions about personal topics, daily life, and familiar subjects.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <strong>Part 1.2 - Picture-Based Questions (A2-B1)</strong>
            <p style={{ marginTop: '8px', color: '#666' }}>
              View 2 related images and answer 3 questions describing, comparing, and expressing preferences.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <strong>Part 2 - Cue Card Task (B1-B2)</strong>
            <p style={{ marginTop: '8px', color: '#666' }}>
              Speak for an extended time on a given topic with guiding prompts.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <strong>Part 3 - Advanced Discussion (B2-C1)</strong>
            <p style={{ marginTop: '8px', color: '#666' }}>
              Engage in a discussion with arguments for and against, plus development and examples.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/student-info')}
            style={{ fontSize: '18px', padding: '16px 48px' }}
          >
            Start Speaking Test
          </button>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f0f0f0' }}>
          <button 
            className="btn" 
            onClick={() => navigate('/teacher/login')}
          >
            Teacher Access
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
