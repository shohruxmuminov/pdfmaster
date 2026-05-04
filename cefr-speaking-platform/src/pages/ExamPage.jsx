import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { part1_1Topics } from '../data/part1_1Topics';
import { part1_2Topics } from '../data/part1_2Topics';
import { part2Topics } from '../data/part2Topics';
import { part3Topics } from '../data/part3Topics';

function ExamPage({ student, onSaveRecording, onComplete }) {
  const navigate = useNavigate();
  const [currentPart, setCurrentPart] = useState(0); // 0: 1.1, 1: 1.2, 2: 2, 3: 3
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [examComplete, setExamComplete] = useState(false);
  const [showPart3Content, setShowPart3Content] = useState(false);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Get random topics for each part (use sessionStorage to persist during exam)
  const getTopicForPart = (partIndex) => {
    const key = `part${partIndex}_topic`;
    let topicId = sessionStorage.getItem(key);
    
    if (!topicId) {
      topicId = Math.floor(Math.random() * 60);
      sessionStorage.setItem(key, topicId);
    }
    
    switch(partIndex) {
      case 0: return part1_1Topics[parseInt(topicId)];
      case 1: return part1_2Topics[parseInt(topicId)];
      case 2: return part2Topics[parseInt(topicId)];
      case 3: return part3Topics[parseInt(topicId)];
      default: return null;
    }
  };

  const currentTopic = getTopicForPart(currentPart);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          
          const recording = {
            id: Date.now().toString(),
            part: currentPart + 1,
            questionIndex: currentQuestion,
            topic: currentTopic.topic,
            audio: base64Audio,
            timestamp: new Date().toISOString()
          };
          
          onSaveRecording(student.id, recording);
        };
        
        setAudioChunks([]);
        stopTimer();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to continue with the test.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    stopRecording();
    
    if (currentPart === 0) {
      // Part 1.1 - 3 questions
      if (currentQuestion < 2) {
        setCurrentQuestion(prev => prev + 1);
        setTimeout(() => startRecording(), 500);
      } else {
        setCurrentPart(1);
        setCurrentQuestion(0);
        setTimeout(() => startRecording(), 500);
      }
    } else if (currentPart === 1) {
      // Part 1.2 - 3 questions
      if (currentQuestion < 2) {
        setCurrentQuestion(prev => prev + 1);
        setTimeout(() => startRecording(), 500);
      } else {
        setCurrentPart(2);
        setCurrentQuestion(0);
        setTimeout(() => startRecording(), 500);
      }
    } else if (currentPart === 2) {
      // Part 2 - single cue card
      setCurrentPart(3);
      setCurrentQuestion(0);
      setShowPart3Content(false);
    } else if (currentPart === 3) {
      // Part 3 - complete exam
      stopRecording();
      setExamComplete(true);
      onComplete(student.id);
    }
  };

  const getPartName = (index) => {
    switch(index) {
      case 0: return 'Part 1.1';
      case 1: return 'Part 1.2';
      case 2: return 'Part 2';
      case 3: return 'Part 3';
      default: return '';
    }
  };

  if (examComplete) {
    return (
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Test Complete!</h1>
          <p style={{ fontSize: '18px', marginBottom: '32px' }}>
            Thank you for completing the speaking test, {student.name}.
            Your recordings have been saved and will be evaluated by your teacher.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/results/${student.id}`)}
            style={{ fontSize: '16px', padding: '14px 32px' }}
          >
            View Your Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav-header">
        <div className="logo">CEFR Speaking Test</div>
        <div style={{ fontWeight: '600' }}>{student.name} {student.surname}</div>
      </div>

      {/* Progress Indicator */}
      <div className="progress-sections">
        {[0, 1, 2, 3].map((partIndex) => (
          <div 
            key={partIndex}
            className={`progress-item ${currentPart === partIndex ? 'active' : ''} ${currentPart > partIndex ? 'completed' : ''}`}
          >
            {getPartName(partIndex)}
          </div>
        ))}
      </div>

      {/* Student Info */}
      <div className="student-info">
        <strong>Candidate:</strong> {student.name} {student.surname} | 
        <strong> Date:</strong> {new Date(student.date).toLocaleString()}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Recording... {formatTime(timer)}</span>
        </div>
      )}

      {/* Part Content */}
      <div className="card">
        <h2 className="card-title">{getPartName(currentPart)}: {currentTopic?.topic}</h2>

        {/* Part 1.1 - Basic Questions */}
        {currentPart === 0 && (
          <div>
            <p className="question-text">
              Question {currentQuestion + 1} of 3: {currentTopic?.questions[currentQuestion]}
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Please answer the question clearly and naturally.
            </p>
          </div>
        )}

        {/* Part 1.2 - Picture Questions */}
        {currentPart === 1 && (
          <div>
            <div className="image-container">
              <div className="image-box">
                <div style={{ 
                  width: '300px', 
                  height: '200px', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#666',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  Image 1: {currentTopic?.imagePrompts[0]}
                </div>
                <p className="image-caption">Image A</p>
              </div>
              <div className="image-box">
                <div style={{ 
                  width: '300px', 
                  height: '200px', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#666',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  Image 2: {currentTopic?.imagePrompts[1]}
                </div>
                <p className="image-caption">Image B</p>
              </div>
            </div>
            
            <p className="question-text" style={{ marginTop: '24px' }}>
              Question {currentQuestion + 1} of 3: {currentTopic?.questions[currentQuestion]}
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Look at both images and answer the question.
            </p>
          </div>
        )}

        {/* Part 2 - Cue Card */}
        {currentPart === 2 && (
          <div>
            <div style={{ 
              border: '3px solid #000', 
              padding: '24px',
              backgroundColor: '#fafafa',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                Cue Card
              </h3>
              <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                {currentTopic?.topic}
              </p>
              <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
                {currentTopic?.prompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              You have 1 minute to prepare (not timed here). Speak for 1-2 minutes about this topic.
            </p>
          </div>
        )}

        {/* Part 3 - Advanced Discussion */}
        {currentPart === 3 && (
          <div>
            {!showPart3Content ? (
              <div>
                <p className="question-text" style={{ fontSize: '22px' }}>
                  {currentTopic?.topic}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowPart3Content(true);
                    setTimeout(() => startRecording(), 500);
                  }}
                  style={{ marginTop: '20px' }}
                >
                  Show Discussion Points & Start Speaking
                </button>
              </div>
            ) : (
              <div>
                <div className="argument-section argument-for">
                  <strong>Argument FOR:</strong>
                  <p style={{ marginTop: '8px' }}>{currentTopic?.argumentFor}</p>
                </div>

                <div className="argument-section argument-against">
                  <strong>Argument AGAINST:</strong>
                  <p style={{ marginTop: '8px' }}>{currentTopic?.argumentAgainst}</p>
                </div>

                <div className="argument-section">
                  <strong>Development:</strong>
                  <p style={{ marginTop: '8px' }}>{currentTopic?.development}</p>
                </div>

                <div className="example-answer">
                  <strong>Example Answer:</strong>
                  <p style={{ marginTop: '8px' }}>{currentTopic?.exampleAnswer}</p>
                </div>

                <p style={{ marginTop: '20px', color: '#666' }}>
                  Discuss this topic considering the points above. Share your opinion and reasoning.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {!isRecording && currentPart === 3 && !showPart3Content ? (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowPart3Content(true);
                setTimeout(() => startRecording(), 500);
              }}
            >
              Begin Discussion
            </button>
          ) : !isRecording ? (
            <button 
              className="btn btn-primary"
              onClick={startRecording}
            >
              Start Recording
            </button>
          ) : (
            <button 
              className="btn"
              onClick={handleNextQuestion}
            >
              {currentPart === 3 ? 'Finish Test' : currentPart === 2 ? 'Continue to Part 3' : 'Next Question'}
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9f9f9', border: '2px solid #000' }}>
        <strong>Instructions:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Click "Start Recording" when you're ready to speak</li>
          <li>Speak clearly and naturally as in a real exam</li>
          <li>Click "Next" when you finish answering</li>
          <li>The system will automatically record your voice</li>
          <li>All parts must be completed in one session</li>
        </ul>
      </div>
    </div>
  );
}

export default ExamPage;
