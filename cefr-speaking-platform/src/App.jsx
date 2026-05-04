import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StudentInfoPage from './pages/StudentInfoPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import { loadStudents, saveStudents } from './services/storageService';

function App() {
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    const loadedStudents = loadStudents();
    setStudents(loadedStudents);
  }, []);

  const handleStudentStart = (name, surname) => {
    const newStudent = {
      id: Date.now().toString(),
      name,
      surname,
      date: new Date().toISOString(),
      recordings: [],
      score: null,
      feedback: null
    };
    setCurrentStudent(newStudent);
    return newStudent;
  };

  const handleSaveRecording = (studentId, recording) => {
    setStudents(prev => {
      const updated = prev.map(s => 
        s.id === studentId 
          ? { ...s, recordings: [...s.recordings, recording] }
          : s
      );
      saveStudents(updated);
      return updated;
    });
  };

  const handleCompleteExam = (studentId) => {
    setStudents(prev => {
      const updated = [...prev];
      saveStudents(updated);
      return updated;
    });
  };

  const handleUpdateEvaluation = (studentId, score, feedback) => {
    setStudents(prev => {
      const updated = prev.map(s => 
        s.id === studentId 
          ? { ...s, score, feedback }
          : s
      );
      saveStudents(updated);
      return updated;
    });
  };

  const handleDeleteStudent = (studentId) => {
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      saveStudents(updated);
      return updated;
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/student-info" 
          element={
            <StudentInfoPage 
              onStart={handleStudentStart} 
            />
          } 
        />
        <Route 
          path="/exam" 
          element={
            currentStudent ? (
              <ExamPage 
                student={currentStudent}
                onSaveRecording={handleSaveRecording}
                onComplete={handleCompleteExam}
              />
            ) : (
              <Navigate to="/student-info" />
            )
          } 
        />
        <Route 
          path="/results/:studentId" 
          element={
            <ResultsPage 
              students={students}
            />
          } 
        />
        <Route 
          path="/teacher/login" 
          element={<TeacherLoginPage />} 
        />
        <Route 
          path="/teacher/dashboard" 
          element={
            <TeacherDashboard 
              students={students}
              onUpdateEvaluation={handleUpdateEvaluation}
              onDeleteStudent={handleDeleteStudent}
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
