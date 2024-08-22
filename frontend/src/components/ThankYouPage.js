import React, { useEffect, useState } from 'react';
import { Container, Alert } from 'react-bootstrap';
import axios from 'axios';

function ThankYouPage({ participantId }) {
  const [completionCode, setCompletionCode] = useState('');
  const [completionUrl, setCompletionUrl] = useState('');

  useEffect(() => {
    axios.get(`/api/completion-code?participantId=${participantId}`)
      .then(response => {
        setCompletionCode(response.data.completionCode);
        setCompletionUrl(response.data.completionUrl);
      })
      .catch(error => console.error('Error getting completion code:', error));
  }, [participantId]);

  useEffect(() => {
    if (completionUrl) {
      const redirectTimer = setTimeout(() => {
        window.location.href = completionUrl;
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(redirectTimer);
    }
  }, [completionUrl]);

  return (
    <Container className="mt-5 text-center">
      <h1>Thank You for Participating!</h1>
      <p className="lead">Your contribution to this study is greatly appreciated.</p>
      <Alert variant="success">
        <Alert.Heading>Your Completion Code:</Alert.Heading>
        <h2>{completionCode}</h2>
      </Alert>
      <p>You will be redirected to Prolific in a few seconds. If not, please click the following link:</p>
      <a href={completionUrl} className="btn btn-primary">Return to Prolific</a>
    </Container>
  );
}

export default ThankYouPage;