import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

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

function AnnotationLayout({ 
  title, 
  item, 
  questions, 
  answers, 
  onAnswerChange, 
  onSubmit, 
  submitButtonText,
  explanations 
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

  return (
    <Container className="mt-5">
      <h2>{title}</h2>
      <Row>
        <Col md={explanations ? 6 : 12}>
          <h3>{item.contentType === 'website' ? 'Website' : 'Search Snippet'}</h3>
          <div className="border p-3 mb-3">
            {item.content}
          </div>
          <Form>
            {questions.map(renderQuestion)}
            <Button onClick={onSubmit}>{submitButtonText}</Button>
          </Form>
        </Col>
        {explanations && (
          <Col md={6}>
            <h3>Explanations</h3>
            {questions.map(question => (
              <div key={question.id} className="mb-3">
                <h4>{question.text}</h4>
                <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                <p><strong>Explanation:</strong> {question.explanation}</p>
              </div>
            ))}
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default AnnotationLayout;