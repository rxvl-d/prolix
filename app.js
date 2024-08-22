import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import WelcomePage from './components/WelcomePage';
import OnboardingPage from './components/OnboardingPage';
import AssessmentPage from './components/AssessmentPage';
import LiveAnnotationPage from './components/LiveAnnotationPage';
import ThankYouPage from './components/ThankYouPage';

function App() {
  const [participantId, setParticipantId] = useState(null);
  const [currentStage, setCurrentStage] = useState('welcome');

  useEffect(() => {
    // Extract Prolific parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('PROLIFIC_PID');
    const studyId = urlParams.get('STUDY_ID');
    const sessionId = urlParams.get('SESSION_ID');

    if (pid && studyId && sessionId) {
      setParticipantId(pid);
      // Initialize participant in backend
      axios.post('/api/initialize', { pid, studyId, sessionId })
        .then(response => {
          setCurrentStage(response.data.currentStage);
        })
        .catch(error => console.error('Error initializing participant:', error));
    }
  }, []);

  const handleStageComplete = (nextStage) => {
    setCurrentStage(nextStage);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              currentStage === 'welcome' ? 
                <WelcomePage onComplete={() => handleStageComplete('onboarding')} /> : 
                <Navigate to={`/${currentStage}`} replace />
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              currentStage === 'onboarding' ? 
                <OnboardingPage 
                  participantId={participantId} 
                  onComplete={() => handleStageComplete('assessment')} 
                /> : 
                <Navigate to={`/${currentStage}`} replace />
            } 
          />
          <Route 
            path="/assessment" 
            element={
              currentStage === 'assessment' ? 
                <AssessmentPage 
                  participantId={participantId} 
                  onComplete={() => handleStageComplete('live')} 
                /> : 
                <Navigate to={`/${currentStage}`} replace />
            } 
          />
          <Route 
            path="/live" 
            element={
              currentStage === 'live' ? 
                <LiveAnnotationPage 
                  participantId={participantId} 
                  onComplete={() => handleStageComplete('thank-you')} 
                /> : 
                <Navigate to={`/${currentStage}`} replace />
            } 
          />
          <Route 
            path="/thank-you" 
            element={
              currentStage === 'thank-you' ? 
                <ThankYouPage participantId={participantId} /> : 
                <Navigate to={`/${currentStage}`} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;