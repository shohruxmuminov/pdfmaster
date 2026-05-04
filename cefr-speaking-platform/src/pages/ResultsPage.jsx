import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResultsPage({ students }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const student = students.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
          <h1>No Results Found</h1>
          <p>Please complete the speaking test first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getPartRecordings = (partNumber) => {
    return student.recordings.filter(r => r.part === partNumber);
  };

  return (
    <div className="container">
      <div className="nav-header">
        <div className="logo">CEFR Speaking Test - Results</div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="student-info">
          <h2 style={{ marginBottom: '12px' }}>{student.name} {student.surname}</h2>
          <p><strong>Test Date:</strong> {new Date(student.date).toLocaleString()}</p>
        </div>

        {/* Score Display */}
        {student.score !== null && (
          <div className="score-display">
            Score: {student.score} / 75
          </div>
        )}

        {/* Feedback */}
        {student.feedback && (
          <div className="feedback-box">
            <h3 style={{ marginBottom: '12px' }}>Teacher Feedback</h3>
            <p style={{ lineHeight: '1.8' }}>{student.feedback}</p>
          </div>
        )}

        {/* Recordings by Part */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">Your Recordings</h3>

          {/* Part 1.1 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              Part 1.1 - Basic Questions ({getPartRecordings(1).length} recordings)
            </h4>
            {getPartRecordings(1).map((recording, index) => (
              <div key={recording.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f9f9f9' }}>
                <p style={{ marginBottom: '8px' }}><strong>Question {index + 1}:</strong> {recording.topic}</p>
                <audio controls className="audio-player">
                  <source src={recording.audio} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Recorded: {new Date(recording.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Part 1.2 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              Part 1.2 - Picture Questions ({getPartRecordings(2).length} recordings)
            </h4>
            {getPartRecordings(2).map((recording, index) => (
              <div key={recording.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f9f9f9' }}>
                <p style={{ marginBottom: '8px' }}><strong>Question {index + 1}:</strong> {recording.topic}</p>
                <audio controls className="audio-player">
                  <source src={recording.audio} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Recorded: {new Date(recording.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Part 2 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              Part 2 - Cue Card Task ({getPartRecordings(3).length} recording)
            </h4>
            {getPartRecordings(3).map((recording) => (
              <div key={recording.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f9f9f9' }}>
                <p style={{ marginBottom: '8px' }}><strong>Topic:</strong> {recording.topic}</p>
                <audio controls className="audio-player">
                  <source src={recording.audio} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Recorded: {new Date(recording.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Part 3 */}
          <div>
            <h4 style={{ marginBottom: '12px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              Part 3 - Advanced Discussion ({getPartRecordings(4).length} recording)
            </h4>
            {getPartRecordings(4).map((recording) => (
              <div key={recording.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f9f9f9' }}>
                <p style={{ marginBottom: '8px' }}><strong>Topic:</strong> {recording.topic}</p>
                <audio controls className="audio-player">
                  <source src={recording.audio} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Recorded: {new Date(recording.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {student.score === null && (
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            backgroundColor: '#fff3cd', 
            border: '2px solid #ffc107',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '0' }}>
              ⏳ Your test is awaiting evaluation by your teacher. Please check back later for your score and feedback.
            </p>
          </div>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button className="btn" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
