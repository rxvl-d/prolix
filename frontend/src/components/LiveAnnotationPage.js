import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';
import AnnotationLayout from './AnnotationLayout';

function LiveAnnotationPage({ participantId, onComplete }) {
  const [currentItem, setCurrentItem] = useState(0);
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch live annotation items from the backend
    axios.get(`/api/live-annotation?participantId=${participantId}`)
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching live annotation items:', error));
  }, [participantId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    axios.post('/api/submit-annotation', { participantId, itemId: items[currentItem].id, answers })
      .then(() => {
        if (currentItem < items.length - 1) {
          setCurrentItem(prev => prev + 1);
          setAnswers({});
          setProgress((currentItem + 1) / items.length * 100);
        } else {
          onComplete();
        }
      })
      .catch(error => console.error('Error submitting annotation:', error));
  };

  if (items.length === 0) return <div>Loading...</div>;

  const item = items[currentItem];

  return (
    <>
      <ProgressBar now={progress} label={`${progress.toFixed(0)}%`} className="mb-4" />
      <AnnotationLayout
        title={`Live Annotation: Item ${currentItem + 1} of ${items.length}`}
        item={item}
        questions={item.questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onSubmit={handleSubmit}
        submitButtonText={currentItem < items.length - 1 ? 'Submit and Next' : 'Submit and Finish'}
      />
    </>
  );
}

export default LiveAnnotationPage;