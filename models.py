from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Participant(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    study_id = db.Column(db.String(50), nullable=False)
    session_id = db.Column(db.String(50), nullable=False)
    completion_code = db.Column(db.String(20), nullable=True)
    current_stage = db.Column(db.String(20), default='welcome')
    score = db.Column(db.Float, nullable=True)

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.String(50), db.ForeignKey('participant.id'), nullable=False)
    content_type = db.Column(db.String(20), nullable=False)  # 'website' or 'snippet'
    content = db.Column(db.Text, nullable=False)
    answers = db.Column(db.JSON, nullable=False)
    stage = db.Column(db.String(20), nullable=False)  # 'onboarding', 'assessment', or 'live'

class Content(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # 'website' or 'snippet'
    content = db.Column(db.Text, nullable=False)
    stage = db.Column(db.String(20), nullable=False)  # 'onboarding', 'assessment', or 'live'
    correct_answers = db.Column(db.JSON, nullable=True)
    explanations = db.Column(db.JSON, nullable=True)
