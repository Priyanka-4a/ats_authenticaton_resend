EXPERIENCE="""You are going to write a JSON resume section of "Work Experience" for an applicant applying for job posts.

Step to follow:
1. Analyze my Work details.
2. Create a JSON resume section.

Instructions:
- Maintain truthfulness and objectivity in listing experience.
- Proofread and Correct spelling and grammar errors.
- Aim for clear expression over impressiveness.
- Prefer active voice over passive voice.

<work_experience>
{section_data}
</work_experience>

<example>
"work_experience": [
    {{
      "Job": "Winjit Technologies, Virginia",
      "Job Title": "Software Engineer",
      "Duration": "Jan 2020 - Jun 2022",
      "Responsibilities": [
        "Engineered 10+ RESTful APIs Architecture and Distributed services; Designed 30+ low-latency responsive UI/UX application features with high-quality web architecture; Managed and optimized large-scale Databases. (Systems Design)",  
        "Initiated and Designed a standardized solution for dynamic forms generation, with customizable CSS capabilities feature, which reduces development time by 8x; Led and collaborated with a 12 member cross-functional team. (Idea Generation)"  
        and so on ...
      ]
      "Technologies":[ 
      "React, Angular, HTML5, CSS3, SASS, TypeScript, C#, Visual Basic, .NET, MSSQL, Figma, 
      Google Cloud, FastAPI, Edge.js, Fabric.js, Bootstrap, ASP.NET, Visual Studio, Azure, JSON"]
    }},
    {{
      "Job": "IMATMI, Robbinsville (Remote)",
      "Job Title": "Research Intern",
      "Duration": "Jan 2020 - Jun 2022",
      "Responsibilities": [
        "Conducted research and developed a range of ML and statistical models to design analytical tools and streamline HR processes, optimizing talent management systems for increased efficiency.",
        "Created 'goals and action plan generation' tool for employees, considering their weaknesses to facilitate professional growth.",
        and so on ...
      ]
      "Technologies":[
       "Angular, React, Vue, Express.js, Node.js, HTML5, CSS3, SASS, TypeScript, C#, .NET, MSSQL, 
       Figma, Bootstrap, ASP.NET, PrimeNG, WebGL, Angular Material, Visual Studio, Azure, JSON"
      ]
    }}
  ],
</example>

{format_instructions}
"""

EDUCATIONS = """You are going to write a JSON resume section of "Education" for an applicant applying for job posts.

Step to follow:
1. Analyze my education details.
2. Create a JSON resume section

Instructions:
- Maintain truthfulness and objectivity in listing experience.
- Proofread and Correct spelling and grammar errors.
- Aim for clear expression over impressiveness.
- Prefer active voice over passive voice.

<Education>
{section_data}
</Education>

<example>
"education": [
  {{
    "university": "Master's Degree in engineering, Arizona State University, Tempe, 2015"
  }}
  [and So on ...]
],
</example>

{format_instructions}
"""

SKILLS="""You are going to write a JSON resume section of "Skills" for an applicant applying for job posts.

Step to follow:
1. Analyze my Skills.
2. Create a JSON resume section.

Instructions:
- Maintain truthfulness and objectivity in listing experience.
- Proofread and Correct spelling and grammar errors.
- Aim for clear expression over impressiveness.
- Prefer active voice over passive voice.

<SKILL_SECTION>
{section_data}
</SKILL_SECTION>

<example>
"skill_section": [
    {{
      "name": "Programming Languages",
      "skills": ["Python", "JavaScript", "C#", and so on ...]
    }},
    {{
      "name": "Cloud and DevOps",
      "skills": [ "Azure", "AWS", and so on ... ]
    }},
    and so on ...
  ]
</example>
  
  {format_instructions}
  """

CERTIFICATIONS = """You are going to write a JSON resume section of "Certifications" for an applicant applying for job posts.

Step to follow:
1. Analyze my certification details.
2. Create a JSON resume section.

Instructions:
- Maintain truthfulness and objectivity in listing experience.
- Proofread and Correct spelling and grammar errors.
- Aim for clear expression over impressiveness.
- Prefer active voice over passive voice.

<CERTIFICATIONS>
{section_data}
</CERTIFICATIONS>

<example>
  "certifications": [
    {{
      "name": "Deep Learning Specialization"
    }},
    {{
      "name": "Server-side Backend Development"
    }}
    ...
  ],
</example>

{format_instructions}
"""


