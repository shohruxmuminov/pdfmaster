import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard({ students, onUpdateEvaluation, onDeleteStudent }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  // Filter students by search term
  const filteredStudents = students.filter(student => 
    `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by date (newest first)
  const sortedStudents = [...filteredStudents].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setScore(student.score || '');
    setFeedback(student.feedback || '');
  };

  const handleSubmitEvaluation = () => {
    if (selectedStudent && score !== '') {
      onUpdateEvaluation(selectedStudent.id, parseInt(score), feedback);
      setSelectedStudent({ ...selectedStudent, score: parseInt(score), feedback });
      alert('Evaluation saved successfully!');
    }
  };

  const handleDeleteStudent = () => {
    if (selectedStudent && confirm(`Are you sure you want to delete ${selectedStudent.name} ${selectedStudent.surname}'s record?`)) {
      onDeleteStudent(selectedStudent.id);
      setSelectedStudent(null);
      setScore('');
      setFeedback('');
      alert('Student record deleted.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('teacherAuthenticated');
    navigate('/');
  };

  return (
    <div className="container">
      <div className="nav-header">
        <div className="logo">Teacher Dashboard</div>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Student List */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="card">
            <h2 className="card-title">Students ({sortedStudents.length})</h2>
            
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name or surname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {sortedStudents.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No students found. Students will appear here after completing their tests.
              </p>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {sortedStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    style={{
                      padding: '12px',
                      border: `2px solid ${selectedStudent?.id === student.id ? '#000' : '#ddd'}`,
                      marginBottom: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedStudent?.id === student.id ? '#f0f0f0' : '#fff'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>
                      {student.name} {student.surname}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                      {new Date(student.date).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      {student.recordings.length} recordings | 
                      Score: {student.score !== null ? `${student.score}/75` : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Panel */}
        <div style={{ flex: '1.5', minWidth: '400px' }}>
          {selectedStudent ? (
            <div>
              <div className="card">
                <h2 className="card-title">Student Details</h2>
                
                <div className="student-info">
                  <p><strong>Name:</strong> {selectedStudent.name} {selectedStudent.surname}</p>
                  <p><strong>Date:</strong> {new Date(selectedStudent.date).toLocaleString()}</p>
                  <p><strong>Total Recordings:</strong> {selectedStudent.recordings.length}</p>
                </div>

                {/* Recordings */}
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '12px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                    Recordings by Part
                  </h3>

                  {[1, 2, 3, 4].map((partNum) => {
                    const partRecordings = selectedStudent.recordings.filter(r => r.part === partNum);
                    const partNames = { 1: 'Part 1.1', 2: 'Part 1.2', 3: 'Part 2', 4: 'Part 3' };
                    
                    return (
                      <div key={partNum} style={{ marginBottom: '16px' }}>
                        <strong>{partNames[partNum]}</strong> ({partRecordings.length} recording{partRecordings.length !== 1 ? 's' : ''})
                        {partRecordings.map((recording, idx) => (
                          <div key={recording.id} style={{ marginLeft: '16px', marginTop: '8px', padding: '8px', backgroundColor: '#f9f9f9' }}>
                            <p style={{ fontSize: '13px', marginBottom: '4px' }}>
                              {partNum <= 2 ? `Question ${idx + 1}:` : 'Topic:'} {recording.topic}
                            </p>
                            <audio controls style={{ width: '100%' }}>
                              <source src={recording.audio} type="audio/webm" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluation Form */}
              <div className="card">
                <h2 className="card-title">Evaluation</h2>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Score (0-75) *
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    max="75"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score out of 75"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Feedback *
                  </label>
                  <textarea
                    className="input-field"
                    rows="6"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide detailed feedback on the student's performance..."
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSubmitEvaluation}
                    disabled={!score || score < 0 || score > 75}
                  >
                    Save Evaluation
                  </button>
                  
                  <button 
                    className="btn"
                    onClick={handleDeleteStudent}
                    style={{ borderColor: '#f00', color: '#f00' }}
                  >
                    Delete Record
                  </button>
                </div>

                {selectedStudent.score !== null && (
                  <div className="feedback-box" style={{ marginTop: '20px' }}>
                    <p><strong>Current Score:</strong> {selectedStudent.score} / 75</p>
                    {selectedStudent.feedback && (
                      <p style={{ marginTop: '8px' }}><strong>Current Feedback:</strong></p>
                    )}
                    {selectedStudent.feedback && (
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedStudent.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '18px', color: '#666' }}>
                Select a student from the list to view their recordings and provide evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
