from app import app, db, Task, Participant
import json

questions = [
    {'id': 'q1', 'type': 'yesNoUnclear', 'text': 'Does the website require registration or payment to use it?'},
    {'id': 'q2', 'type': 'yesNoUnclear', 'text': 'Is the grade level explicitly mentioned?'},
    {'id': 'q3', 'type': 'text', 'text': 'Copy/Paste the mentioned grade level (if applicable)'},
    {'id': 'q4', 'type': 'yesNoUnclear', 'text': 'Is the resource appropriate for Klassenstufe 9/10?'},
    {'id': 'q5', 'type': 'multipleChoice', 'text': 'What is the resource\'s type? (Select all that apply)', 
     'options': [
         'Activity Plan', 
         'Assessment', 
         'Assessment Item', 
         'Educator Curriculum Guide', 
         'Lesson Plan', 
         'Physical Learning', 
         'Recorded Lesson', 
         'Supporting Document', 
         'Demonstration/Simulation', 
         'Course', 
         'Images/Visuals', 
         'References', 
         'Other']},
    {'id': 'q6', 'type': 'text', 'text': 'Who published the resource? (Write N/a if unclear)'},
    {'id': 'q7', 'type': 'likert', 'text': 'How trustworthy is the publisher? (If known)'},
    {'id': 'q8', 'type': 'multipleChoice', 'text': 'Does the resource include instructions about how to use it?', 
     'options': [
         'Explicit instructions', 
         'Implicit instructions', 
         'Visually clear instructions', 
         'Visually hidden instructions', 
         'No instructions']},
    {'id': 'q9', 'type': 'multipleChoice', 'text': 'Does the resource explicitly mention any learning goals?', 
     'options': [
         'Explicit learning goals', 
         'Implicit learning goals', 
         'Visually clear list of learning goals', 
         'Visually hidden list of learning goals', 
         'No instructions']}
]

def to_task_dict(simplified, stage):
    return {
        'content_type': 'website',
        'content': simplified['url'],
        'stage': stage,
        'questions': questions,
        'correct_answers': {f'q{i+1}': answer for i, (answer, _) in enumerate(simplified['answers'])},
        'explanations': {f'q{i+1}': explanation for i, (_, explanation) in enumerate(simplified['answers'])}
    }

def seed_database():
    with app.app_context():
        # Clear existing tasks
        Task.query.delete()
        Participant.query.delete()
        # Onboarding tasks
        onboarding_tasks = [ 
            to_task_dict({
                "url": "https://physikkommunizieren.de/themenfelder/8-atommodelle/", 
                "answers": [
                ('No', 'The website does not require registration or payment to access its content.'),
                ('No', 'The grade level is not explicitly mentioned on the website.'),
                ('',   'No grade level was mentioned so this field is left blank.'),
                ('Yes', 'The resource is deemed appropriate for Klassenstufe 9/10.'),
                (['Supporting Document'], 'The resource is categorized as a Supporting Document.'),
                ('IDP Munster', 'The publisher of the resource is identified as IDP Munster.'),
                (5, 'The publisher is considered highly trustworthy with a rating of 5.'),
                ('No instruction', 'The resource does not include any instructions on how to use it.'),
                ('No learning goals', 'The resource does not explicitly mention any learning goals.')
            ]}, 'onboarding'),
            to_task_dict({
                "url": 'http://www.chemienet.info/3-ato.html', 
                "answers": [
                ('No', 'The website does not require registration or payment to access its content.'),
                ('No', 'The grade level is not explicitly mentioned on the website.'),
                ('',   'No grade level was mentioned so this field is left blank.'),
                ('Yes', 'The resource is deemed appropriate for Klassenstufe 9/10.'),
                (['Supporting Document', 'Images/Visuals'], 'The resource is categorized as a Supporting Document.'),
                ('chemienet.info', 'The publisher of the resource is identified as IDP Munster.'),
                (5, 'The publisher is considered highly trustworthy with a rating of 5.'),
                ('No instructions', 'The resource does not include any instructions on how to use it.'),
                ('No learning goals', 'The resource does not explicitly mention any learning goals.')
            ]}, 'onboarding'),
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
        for task in onboarding_tasks: # + assessment_tasks + live_tasks:
            db.session.add(Task(**task))

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()