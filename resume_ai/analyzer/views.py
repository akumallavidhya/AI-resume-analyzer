from rest_framework.decorators import api_view
from rest_framework.response import Response
import PyPDF2
import re
from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


@api_view(['POST'])
def analyze_resume(request):

    resume_text = ""

    if 'resume' in request.FILES:
        pdf_file = request.FILES['resume']
        reader = PyPDF2.PdfReader(pdf_file)

        for page in reader.pages:
            text = page.extract_text()
            if text:
                resume_text += text
    else:
        resume_text = request.data.get("resume_text", "")

    resume_text_lower = resume_text.lower()

    skills_db = [
        "python","django","react","javascript","html","css",
        "machine learning","sql","java","spring"
    ]

    found_skills = []

    for skill in skills_db:
        if re.search(skill, resume_text_lower):
            found_skills.append(skill)

    score = len(found_skills) * 10

    prompt = f"""
    Analyze this resume and give professional feedback.

    Resume:
    {resume_text}

    Provide:
    1. Resume strengths
    2. Weaknesses
    3. Career role suggestions
    """

    try:

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        ai_feedback = response.choices[0].message.content

    except Exception as e:

        ai_feedback = f"""
AI service unavailable.

Basic Resume Feedback:

Strengths:
Detected skills: {', '.join(found_skills)}

Weaknesses:
Consider adding more measurable achievements and project details.

Suggested Roles:
Backend Developer
Full Stack Developer
Machine Learning Engineer
"""

    # ---------- JOB DESCRIPTION MATCHING ----------

    job_description = request.data.get("job_description", "").lower()

    job_skills = []

    for skill in skills_db:
        if skill in job_description:
            job_skills.append(skill)

    match_score = 0
    missing_skills = []

    if job_skills:

        matched = [skill for skill in job_skills if skill in found_skills]

        match_score = int((len(matched) / len(job_skills)) * 100)

        missing_skills = [
            skill for skill in job_skills if skill not in found_skills
        ]

    # ---------- FINAL RESPONSE ----------

    return Response({
        "score": score,
        "skills_detected": found_skills,
        "match_score": match_score,
        "missing_skills": missing_skills,
        "ai_feedback": ai_feedback
    })