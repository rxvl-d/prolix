import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnnotationLayout from './AnnotationLayout';
import { Container, Alert } from 'react-bootstrap';

function OnboardingPage({ participantId, onComplete }) {
  const [currentExample, setCurrentExample] = useState(0);
  const [examples, setExamples] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Fetch onboarding examples from the backend
    axios.get(`/api/onboarding?participantId=${participantId}`)
      .then(response => setExamples(response.data))
      .catch(error => console.error('Error fetching onboarding examples:', error));
  }, [participantId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentExample < examples.length - 1) {
      setCurrentExample(prev => prev + 1);
      setAnswers({});
    } else {
      onComplete();
    }
  };

  if (examples.length === 0) return <div>Loading...</div>;

  const example = examples[currentExample];

  return (
    <Container>
      <Alert variant="success">
        This is an example task. 
        The expected answers and the explanations are on the right. 
        These will not be present when you take the actual assessment.
      </Alert>
    <AnnotationLayout
      title={`Onboarding: Example ${currentExample + 1} of ${examples.length}`}
      item={example}
      questions={example.questions}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      onSubmit={handleNext}
      submitButtonText={currentExample < examples.length - 1 ? 'Next Example' : 'Start Assessment'}
      explanations={example.explanations}
      correctAnswers={example.correctAnswers}
    />
    </Container>
  );
}

export default OnboardingPage;