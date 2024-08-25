import axios from 'axios';
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Form, Navigate, useLoaderData } from 'react-router-dom';

async function loader() {
  const participantId = localStorage.getItem('PARTICIPANT_ID');
  const studyId = localStorage.getItem('STUDY_ID');
  const sessionId = localStorage.getItem('SESSION_ID');
  const currentStage = localStorage.getItem('CURRENT_STAGE');
  if (participantId && studyId && sessionId && currentStage) {
    return { participantId, studyId, sessionId, currentStage };
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const participantId = urlParams.get('PROLIFIC_PID');
    const studyId = urlParams.get('STUDY_ID');
    const sessionId = urlParams.get('SESSION_ID');
    if (participantId && studyId && sessionId) {
      localStorage.setItem('PARTICIPANT_ID', participantId);
      localStorage.setItem('STUDY_ID', studyId);
      localStorage.setItem('SESSION_ID', sessionId);
      const init = await axios.post('/api/initialize', {participantId, studyId, sessionId })
      const currentStage = init.data.currentStage;
      localStorage.setItem('CURRENT_STAGE', currentStage);
      return { participantId, studyId, sessionId, currentStage };
    } else {
      // raise exception. Tell the user that their URL was malformed

      return {};    
      
    }
  }
}

function WelcomePage() {
  const { participantId, studyId, sessionId, currentStage } = useLoaderData();
  if (currentStage == 'welcome') {
  return (
    <Container className="mt-5">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <h1 className="text-center mb-4">Welcome to our annotation study [{participantId}]</h1>
          <p>
            Thank you for participating in our study. You will be asked to annotate 
            websites of learning resources by answering a series of questions about them.
          </p>
          <p>
            The study consists of three stages:
          </p>
          <ol>
            <li>Onboarding: You'll be shown 5 examples with explanations of the expected answers.</li>
            <li>Assessment: You'll annotate 5 items to ensure you understand the task. If you score too low, you will not be able to proceed. 
              <b>NOTE:</b> You will still be paid for the expected 10 minutes of work it would take to complete the assessment.</li>
            <li>Live Annotation: You'll annotate new examples without explanations.</li>
          </ol>
          <p>
            Please click the button below when you're ready to begin the onboarding process.
          </p>
          <div className="text-center">
            <Form method='post'>
              <input type="hidden" name="newStage" value="onboarding" />
              <Button type='submit' variant="primary" size="lg">
                Start Onboarding
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
  } else {
    return <Navigate to="/{currentStage}" replace/>;
  }
}

export {WelcomePage, loader};