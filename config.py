import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///annotations.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ONBOARDING_QUESTIONS = 5
    ASSESSMENT_QUESTIONS = 5
    LIVE_QUESTIONS = 10
    PASS_THRESHOLD = 0.8  # 80% correct answers to pass assessment
    PROLIFIC_COMPLETION_URL = os.environ.get('PROLIFIC_COMPLETION_URL')
    PROLIFIC_SCREEN_OUT_URL = os.environ.get('PROLIFIC_SCREEN_OUT_URL')
