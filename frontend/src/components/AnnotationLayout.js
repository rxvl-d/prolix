import React from 'react';
import { Alert, Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';

const QuestionTypes = {
  LIKERT: 'likert',
  TEXT: 'text',
  YES_NO_UNCLEAR: 'yesNoUnclear',
  MULTIPLE_CHOICE: 'multipleChoice'
};

function LikertScale({ question, value, onChange }) {
  return (
    <Form.Group>
      <Form.Label>{question.text}</Form.Label>
      <div className="d-flex justify-content-between">
        {[1, 2, 3, 4, 5].map((num) => (
          <Form.Check
            key={num}
            type="radio"
            id={`${question.id}-${num}`}
            label={num}
            checked={value === num}
            onChange={() => onChange(question.id, num)}
          />
        ))}
      </div>
    </Form.Group>
  );
}

function YesNoUnclear({ question, value, onChange }) {
  return (
    <Form.Group>
      <Form.Label>{question.text}</Form.Label>
      {['Yes', 'No', 'Unclear'].map((option) => (
        <Form.Check
          key={option}
          type="radio"
          id={`${question.id}-${option}`}
          label={option}
          checked={value === option}
          onChange={() => onChange(question.id, option)}
        />
      ))}
    </Form.Group>
  );
}

function MultipleChoice({ question, value, onChange }) {
  return (
    <Form.Group>
      <Form.Label>{question.text}</Form.Label>
      {question.options.map((option) => (
        <Form.Check
          key={option}
          type="checkbox"
          id={`${question.id}-${option}`}
          label={option}
          checked={value && value.includes(option)}
          onChange={(e) => {
            const newValue = e.target.checked
              ? [...(value || []), option]
              : (value || []).filter(v => v !== option);
            onChange(question.id, newValue);
          }}
        />
      ))}
    </Form.Group>
  );
}

const ContentDisplay = ({ contentType, content }) => {
  if (contentType === 'website') {
    return (
      <div>
        <a href={content} target="_blank" rel="noopener noreferrer">
          Link to learning resource
        </a>
      </div>
    );
  } else if (contentType === 'snippet') {
    return (
      <Alert variant="info">
        <Alert.Heading>Search Snippet</Alert.Heading>
        <p>{content}</p>
      </Alert>
    );
  } else {
    return <p>Unknown content type</p>;
  }
};


function AnnotationLayout({ 
  title, 
  item, 
  questions, 
  answers, 
  onAnswerChange, 
  onSubmit, 
  submitButtonText,
  explanations ,
  correctAnswers
}) {
  const renderQuestion = (question) => {
    switch (question.type) {
      case QuestionTypes.LIKERT:
        return <LikertScale 
          key={question.id} 
          question={question} 
          value={answers[question.id]} 
          onChange={onAnswerChange} 
        />;
      case QuestionTypes.TEXT:
        return (
          <Form.Group key={question.id}>
            <Form.Label>{question.text}</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={answers[question.id] || ''} 
              onChange={(e) => onAnswerChange(question.id, e.target.value)} 
            />
          </Form.Group>
        );
      case QuestionTypes.YES_NO_UNCLEAR:
        return <YesNoUnclear 
          key={question.id} 
          question={question} 
          value={answers[question.id]} 
          onChange={onAnswerChange} 
        />;
      case QuestionTypes.MULTIPLE_CHOICE:
        return <MultipleChoice 
          key={question.id} 
          question={question} 
          value={answers[question.id]} 
          onChange={onAnswerChange} 
        />;
      default:
        return null;
    }
  };

  const addExplanation = (questionItem) => {
    if (explanations && correctAnswers) {
      return <Row>
        <Col md={6}>{questionItem}</Col>
        <Col md={6} border>
          <p><strong>Correct Answer:</strong> {correctAnswers[questionItem.key]}</p>
          <p><strong>Explanation:</strong> {explanations[questionItem.key]}</p>
        </Col>
      </Row>
    }
    else {
      return {questionItem}
    }
  }


  return (
    <Container className="mt-5">
      <h2>{title}</h2>
      <Row>
        <Col md={12}>
          <div className="border p-3 mb-3">
            <ContentDisplay contentType={item.contentType} content={item.content} />
          </div>
          <Form>
            <ListGroup as="ol" numbered>
            {questions.map(renderQuestion).map(addExplanation).map(q => <ListGroup.Item as='li'>{q}</ListGroup.Item>)}
            </ListGroup>
            <Button onClick={onSubmit}>{submitButtonText}</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default AnnotationLayout;