from app import app, db, Task
import json

def seed_database():
    with app.app_context():
        # Clear existing tasks
        Task.query.delete()

        # Onboarding tasks
        onboarding_tasks = [
            {
                'content_type': 'website',
                'content': 'This is a sample website content for onboarding.',
                'stage': 'onboarding',
                'questions': json.dumps([
                    {'id': 'q1', 'type': 'likert', 'text': 'How relevant is this content?'},
                    {'id': 'q2', 'type': 'text', 'text': 'Explain your reasoning for the previous answer.'},
                    {'id': 'q3', 'type': 'yesNoUnclear', 'text': 'Is this content factual?'},
                    {'id': 'q4', 'type': 'multipleChoice', 'text': 'Which of the following topics are covered? (Select all that apply)', 'options': ['Technology', 'Science', 'Politics', 'Entertainment']}
                ]),
                'correct_answers': json.dumps({
                    'q1': 4,
                    'q2': 'The content is highly relevant because it covers multiple topics.',
                    'q3': 'Yes',
                    'q4': ['Technology', 'Science']
                }),
                'explanations': json.dumps({
                    'q1': 'The content covers multiple topics, making it highly relevant.',
                    'q2': 'A good explanation should reference specific aspects of the content.',
                    'q3': 'The content presents factual information about technology and science.',
                    'q4': 'The content primarily focuses on technology and science topics.'
                })
            },
            # Add more onboarding tasks here
        ]

        # Assessment tasks
        assessment_tasks = [
            {
                'content_type': 'snippet',
                'content': 'This is a sample search snippet for assessment.',
                'stage': 'assessment',
                'questions': json.dumps([
                    {'id': 'q1', 'type': 'likert', 'text': 'How relevant is this snippet?'},
                    {'id': 'q2', 'type': 'text', 'text': 'Summarize the main point of this snippet.'},
                    {'id': 'q3', 'type': 'yesNoUnclear', 'text': 'Does this snippet contain opinion?'},
                    {'id': 'q4', 'type': 'multipleChoice', 'text': 'What type of content is this? (Select all that apply)', 'options': ['News', 'Opinion', 'Research', 'Advertisement']}
                ]),
                'correct_answers': json.dumps({
                    'q1': 3,
                    'q2': 'The snippet provides a brief overview of a topic.',
                    'q3': 'No',
                    'q4': ['News']
                })
            },
            # Add more assessment tasks here
        ]

        # Live annotation tasks
        live_tasks = [
            {
                'content_type': 'website',
                'content': 'This is a sample website content for live annotation.',
                'stage': 'live',
                'questions': json.dumps([
                    {'id': 'q1', 'type': 'likert', 'text': 'How relevant is this content?'},
                    {'id': 'q2', 'type': 'text', 'text': 'Explain your reasoning for the previous answer.'},
                    {'id': 'q3', 'type': 'yesNoUnclear', 'text': 'Is this content factual?'},
                    {'id': 'q4', 'type': 'multipleChoice', 'text': 'Which of the following topics are covered? (Select all that apply)', 'options': ['Technology', 'Science', 'Politics', 'Entertainment']}
                ])
            },
            # Add more live annotation tasks here
        ]

        # Add all tasks to the database
        for task in onboarding_tasks + assessment_tasks + live_tasks:
            db.session.add(Task(**task))

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()