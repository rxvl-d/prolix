import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

function WelcomePage({ onComplete }) {
  return (
    <Container className="mt-5">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <h1 className="text-center mb-4">Welcome to the Annotation Study</h1>
          <p>
            Thank you for participating in our study. You will be asked to annotate 
            websites and search snippets by answering a series of questions about them.
          </p>
          <p>
            The study consists of three stages:
          </p>
          <ol>
            <li>Onboarding: You'll be shown 5 examples with explanations.</li>
            <li>Assessment: You'll annotate 5 items to ensure you understand the task.</li>
            <li>Live Annotation: You'll annotate a series of items for our study.</li>
          </ol>
          <p>
            Please click the button below when you're ready to begin the onboarding process.
          </p>
          <div className="text-center">
            <Button variant="primary" size="lg" onClick={onComplete}>
              Start Onboarding
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default WelcomePage;