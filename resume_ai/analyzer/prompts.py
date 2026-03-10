def build_prompt(resume_text):

    prompt = f"""
You are an HR recruiter.

Analyze the resume and provide:

1. Key Skills
2. Resume Summary
3. Suitable Job Roles
4. Suggestions to improve the resume

Resume:
{resume_text}
"""

    return prompt