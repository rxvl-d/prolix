import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button } from 'react-bootstrap';
import AnnotationLayout from './AnnotationLayout';

function AssessmentPage() {
  const participantId = localStorage.getItem('PROLIFIC_PID');
  const [currentItem, setCurrentItem] = useState(0);
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  useEffect(() => {
    // Fetch assessment items from the backend
    axios.get(`/api/assessment?participantId=${participantId}`)
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching assessment items:', error));
  }, [participantId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (currentItem < items.length - 1) {
      setCurrentItem(prev => prev + 1);
      setAnswers({});
    } else {
      axios.post('/api/submit-assessment', { participantId, answers })
        .then(response => {
          setAssessmentResult(response.data);
          setSubmitted(true);
        })
        .catch(error => console.error('Error submitting assessment:', error));
    }
  };

  useEffect(() => {
    if (submitted && assessmentResult) {
      if (assessmentResult.passed) {
        // onComplete();
      } else {
        // Redirect to Prolific screen-out URL
        axios.get(`/api/completion-code?participantId=${participantId}`)
          .then(response => {
            window.location.href = response.data.completionUrl;
          })
          .catch(error => console.error('Error getting completion code:', error));
      }
    }
  }, [submitted, assessmentResult, participantId]);

  if (items.length === 0) return <div>Loading...</div>;

  if (submitted) {
    return (
      <Alert variant={assessmentResult.passed ? 'success' : 'danger'}>
        <h4>Assessment Complete</h4>
        <p>Your score: {(assessmentResult.score * 100).toFixed(2)}%</p>
        {assessmentResult.passed ? (
          <p>Congratulations! You've passed the assessment. You will now be redirected to the live annotation tasks.</p>
        ) : (
          <p>Thank you for your participation. Unfortunately, you didn't pass the assessment. You will be redirected to Prolific shortly.</p>
        )}
      </Alert>
    );
  }

  const item = items[currentItem];

  return (
    <AnnotationLayout
      title={`Assessment: Item ${currentItem + 1} of ${items.length}`}
      item={item}
      questions={item.questions}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      onSubmit={handleSubmit}
      submitButtonText={currentItem < items.length - 1 ? 'Next Item' : 'Submit Assessment'}
    />
  );
}

export default AssessmentPage;