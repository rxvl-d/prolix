import json
from flask import Flask, request, jsonify, redirect, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
import random
import string

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///annotations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define models
class Participant(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    study_id = db.Column(db.String(50), nullable=False)
    session_id = db.Column(db.String(50), nullable=False)
    completion_code = db.Column(db.String(20), nullable=True)
    current_stage = db.Column(db.String(20), default='welcome')
    assessment_score = db.Column(db.Float, nullable=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    stage = db.Column(db.String(20), nullable=False)
    questions = db.Column(db.JSON, nullable=False)
    correct_answers = db.Column(db.JSON, nullable=True)
    explanations = db.Column(db.JSON, nullable=True)

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.String(50), db.ForeignKey('participant.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    answers = db.Column(db.JSON, nullable=False)

@app.route('/api/initialize', methods=['POST'])
def initialize_participant():
    data = request.json
    participant = Participant(
        id=data['pid'],
        study_id=data['studyId'],
        session_id=data['sessionId']
    )
    db.session.add(participant)
    db.session.commit()
    return jsonify({"currentStage": participant.current_stage})

@app.route('/api/onboarding')
def get_onboarding_tasks():
    participant_id = request.args.get('participantId')
    tasks = Task.query.filter_by(stage='onboarding').all()
    return jsonify([{
        'id': task.id,
        'contentType': task.content_type,
        'content': task.content,
        'questions': task.questions,
        'correctAnswers': task.correct_answers,
        'explanations': task.explanations
    } for task in tasks])

@app.route('/api/assessment')
def get_assessment_tasks():
    participant_id = request.args.get('participantId')
    tasks = Task.query.filter_by(stage='assessment').all()
    return jsonify([{
        'id': task.id,
        'contentType': task.content_type,
        'content': task.content,
        'questions': task.questions
    } for task in tasks])

@app.route('/api/live-annotation')
def get_live_tasks():
    participant_id = request.args.get('participantId')
    tasks = Task.query.filter_by(stage='live').all()
    return jsonify([{
        'id': task.id,
        'contentType': task.content_type,
        'content': task.content,
        'questions': task.questions
    } for task in tasks])

@app.route('/api/submit-annotation', methods=['POST'])
def submit_annotation():
    data = request.json
    annotation = Annotation(
        participant_id=data['participantId'],
        task_id=data['itemId'],
        answers=data['answers']
    )
    db.session.add(annotation)
    db.session.commit()
    return jsonify({"message": "Annotation submitted successfully"})


@app.route('/api/submit-assessment', methods=['POST'])
def submit_assessment():
    data = request.json
    participant = Participant.query.get(data['participantId'])
    
    # Fetch all assessment tasks
    assessment_tasks = Task.query.filter_by(stage='assessment').all()
    
    total_questions = 0
    correct_answers = 0

    for task in assessment_tasks:
        task_answers = data['answers'].get(str(task.id), {})
        correct_task_answers = json.loads(task.correct_answers)
        
        for question_id, correct_answer in correct_task_answers.items():
            total_questions += 1
            user_answer = task_answers.get(question_id)
            
            if isinstance(correct_answer, list):  # For multiple choice questions
                if set(correct_answer) == set(user_answer):
                    correct_answers += 1
            elif isinstance(correct_answer, int):  # For Likert scale questions
                if correct_answer == user_answer:
                    correct_answers += 1
            elif correct_answer.lower() == user_answer.lower():  # For text and yes/no/unclear questions
                correct_answers += 1

    score = correct_answers / total_questions if total_questions > 0 else 0
    
    participant.assessment_score = score
    participant.current_stage = 'live' if score >= app.config['PASS_THRESHOLD'] else 'screened_out'
    
    # Save the participant's answers
    for task_id, answers in data['answers'].items():
        annotation = Annotation(
            participant_id=participant.id,
            task_id=int(task_id),
            answers=json.dumps(answers)
        )
        db.session.add(annotation)

    db.session.commit()
    
    return jsonify({
        "score": score,
        "passed": score >= app.config['PASS_THRESHOLD']
    })

@app.route('/api/completion-code')
def get_completion_code():
    participant_id = request.args.get('participantId')
    participant = Participant.query.get(participant_id)
    if not participant.completion_code:
        participant.completion_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        db.session.commit()
    
    if participant.current_stage == 'screened_out':
        completion_url = app.config['PROLIFIC_SCREEN_OUT_URL']
    else:
        completion_url = app.config['PROLIFIC_COMPLETION_URL']
    
    return jsonify({
        "completionCode": participant.completion_code,
        "completionUrl": completion_url + participant.completion_code
    })

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)