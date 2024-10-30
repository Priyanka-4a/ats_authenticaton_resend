from typing import List, Optional
from pydantic import BaseModel, Field

class Certification(BaseModel):
    name: str = Field(description="The name of the certification.")

class Certifications(BaseModel):
    certifications: List[Certification] = Field(description="job relevant certifications that you have earned, including the name, issuing organization, and a link to verify the certification.")

class Education(BaseModel):
    university: str = Field(description="The name of the of the degree and institution where the degree was obtained with location.")

class Educations(BaseModel):
    education: List[Education] = Field(description="Educational qualifications, including degree, institution, dates, and relevant courses.")

class SkillSection(BaseModel):
    name: str = Field(description="name or title of the skill group and competencies relevant to the job, such as programming languages, data science, tools & technologies, cloud & DevOps, full stack,  or soft skills.")
    skills: List[str] = Field(description="Specific skills or competencies within the skill group, such as Python, JavaScript, C#, SQL in programming languages.")

class SkillSections(BaseModel):
    skill_section: List[SkillSection] = Field(description="Skill sections, each containing a group of skills and competencies relevant to the job.")

class Experience(BaseModel):
    Job: str = Field(description="The company name and location. e.g. Winjit Technologies, Virginia")
    JobTitle: str = Field(description="The job title in the company. e.g. Software Engineer")
    Duration: str = Field(description="The start date and end date of the employment period. e.g., Aug 2023")
    Responsibilities: List[str] = Field(description="A list of 3 bullet points describing the work experience, tailored to match job requirements. Each bullet point should follow the 'Did X by doing Y, achieved Z' format, quantify impact, implicitly use STAR methodology, use strong action verbs, and be highly relevant to the specific job. Ensure clarity, active voice, and impeccable grammar.")
    Technologies: List[str] = Field(description="A list of Technologies that are used in the Job")

class Experiences(BaseModel):
    work_experience: List[Experience] = Field(description="Work experiences, including job title, company, location, dates, and description.")

class ResumeSchema(BaseModel):
    name: str = Field(description="The full name of the candidate.")
    summary: Optional[str] = Field(description="A brief summary or objective statement highlighting key skills, experience, and career goals.")
    work_experience: List[Experience] = Field(description="Work experiences, including job title, company, location, dates, and description.")
    education: List[Education] = Field(description="Educational qualifications, including degree, institution, dates, and relevant courses.")
    skill_section: List[SkillSection] = Field(description="Skill sections, each containing a group of skills and competencies relevant to the job.")
    certifications: List[Certification] = Field(description="job relevant certifications that you have earned, including the name, issuing organization, and a link to verify the certification.")