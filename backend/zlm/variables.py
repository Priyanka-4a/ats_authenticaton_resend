from zlm.prompts.sections_prompt import EXPERIENCE, SKILLS, EDUCATIONS, CERTIFICATIONS
from zlm.schemas.sections_schemas import Certifications, Educations, Experiences, SkillSections

GPT_EMBEDDING_MODEL = "text-embedding-ada-002"
# text-embedding-3-large, text-embedding-3-small

LLM_MAPPING = {
    'GPT': {
        "api_env": "OPEN_API_KEY",
        "model": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4-1106-preview", "gpt-3.5-turbo"], 
    },
    'Gemini': {
        "api_env": "GEMINI_API_KEY",
        "model": ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-1.5-pro-latest", "gemini-1.5-pro-exp-0801"], # "gemini-1.0-pro", "gemini-1.0-pro-latest"
    }
}

section_mapping = {
    "work_experience": {"prompt":EXPERIENCE, "schema": Experiences},
    "skill_section": {"prompt":SKILLS, "schema": SkillSections},
    "education": {"prompt":EDUCATIONS, "schema": Educations},
    "certifications": {"prompt":CERTIFICATIONS, "schema": Certifications},
}