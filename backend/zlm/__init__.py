import os
import json
import re
import validators
import numpy as np
import streamlit as st
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from zlm.schemas.sections_schemas import ResumeSchema
from zlm.utils import utils
from zlm.utils.latex_ops import latex_to_pdf
from zlm.utils.llm_models import ChatGPT
from zlm.utils.data_extraction import read_data_from_url, extract_text
from zlm.prompts.resume_prompt import  RESUME_WRITER_PERSONA, JOB_DETAILS_EXTRACTOR, RESUME_DETAILS_EXTRACTOR
from zlm.schemas.job_details_schema import JobDetails
from zlm.variables import LLM_MAPPING, section_mapping

module_dir = os.path.dirname(__file__)
demo_data_path = os.path.join(module_dir, "demo_data", "user_profile.json")
prompt_path = os.path.join(module_dir, "prompts")


class AutoApplyModel:
    """
    A class that represents an Auto Apply Model for job applications.

    Args:
        api_key (str): The OpenAI API key.
        downloads_dir (str, optional): The directory to save downloaded files. Defaults to the default download folder.
        provider (str, optional): The LLM provider to use. Defaults to "Gemini".
        model (str, optional): The LLM model to use. Defaults to "gemini-1.5-flash-latest".
        system prompt (str, optional): The Prompt to use

    Methods:
        get_prompt(system_prompt_path: str) -> str: Returns the system prompt from the specified path.
        resume_to_json(pdf_path: str) -> dict: Extracts resume details from the specified PDF path.
        user_data_extraction(user_data_path: str) -> dict: Extracts user data from the specified path.
        job_details_extraction(url: str) -> dict: Extracts job details from the specified job URL.
        resume_builder(job_details: dict, user_data: dict) -> dict: Generates a resume based on job details and user data.
        resume_cv_pipeline(job_url: str, user_data_path: str) -> None: Runs the Auto Apply Pipeline.
    """

    def __init__(
        self, api_key: str = None, provider: str = None, model: str = None, downloads_dir: str = utils.get_default_download_folder(), system_prompt: str = None
    ):
        self.api_key = api_key
        self.provider = provider
        self.model = model
        self.downloads_dir = utils.get_default_download_folder() if downloads_dir is None or downloads_dir.strip() == "" else downloads_dir
        self.system_prompt = system_prompt if system_prompt else RESUME_WRITER_PERSONA
        
        self.llm = self.get_llm_instance()
    
    def get_llm_instance(self):
        if self.provider == "GPT":
            return ChatGPT(api_key=self.api_key, model=self.model, system_prompt=self.system_prompt)
        else:
            raise Exception("Invalid LLM Provider")

    def resume_to_json(self, pdf_path):
        """
        Converts a resume in PDF format to JSON format.
        Args:
            pdf_path (str): The path to the PDF file.
        Returns:
            dict: The resume data in JSON format.
        """
        resume_text = extract_text(pdf_path)
        json_parser = JsonOutputParser(pydantic_object=ResumeSchema)
        prompt = PromptTemplate(
            template=RESUME_DETAILS_EXTRACTOR,
            input_variables=["resume_text"],
            partial_variables={"format_instructions": json_parser.get_format_instructions()}
            ).format(resume_text=resume_text)
        resume_json = self.llm.get_response(prompt=prompt, need_json_output=True)
 
        return resume_json

    @utils.measure_execution_time
    def user_data_extraction(self, user_data_path: str = demo_data_path, is_st=False):
        """
        Extracts user data from the given file path.
        Args:
            user_data_path (str): The path to the user data file.
        Returns:
            dict: The extracted user data in JSON format.
        """
        print("\nFetching user data...")

        if user_data_path is None or (type(user_data_path) is str and user_data_path.strip() == ""):
            user_data_path = demo_data_path
        extension = os.path.splitext(user_data_path)[1]
        if extension == ".pdf":
            user_data = self.resume_to_json(user_data_path)
        elif extension == ".json":
            user_data = utils.read_json(user_data_path)
        elif validators.url(user_data_path):
            user_data = read_data_from_url([user_data_path])
            pass
        else:
            raise Exception("Invalid file format. Please provide a PDF, JSON file or url.")
        
        return user_data

    @utils.measure_execution_time
    def job_details_extraction(self, url: str=None, job_site_content: str=None, is_st=False):
        """
        Extracts job details from the specified job URL.
        Args:
            url (str): The URL of the job posting.
            job_site_content (str): The content of the job posting.
        Returns:
            dict: A dictionary containing the extracted job details.
        """
        print("\nExtracting job details...")

        try:
            # TODO: Handle case where it returns None. sometime, website take time to load, but scraper complete before that.
            if url is not None and url.strip() != "":
                job_site_content = read_data_from_url(url)
            if job_site_content:
                json_parser = JsonOutputParser(pydantic_object=JobDetails)
                prompt = PromptTemplate(
                    template=JOB_DETAILS_EXTRACTOR,
                    input_variables=["job_description"],
                    partial_variables={"format_instructions": json_parser.get_format_instructions()}
                    ).format(job_description=job_site_content)
                job_details = self.llm.get_response(prompt=prompt, need_json_output=True)

                if url is not None and url.strip() != "":
                    job_details["url"] = url

                jd_path = utils.job_doc_name(job_details, self.downloads_dir, "jd")
                utils.write_json(jd_path, job_details)
                print(f"Job Details JSON generated at: {jd_path}")

                if url is not None and url.strip() != "":
                    del job_details['url']
                
                return job_details, jd_path
            else:
                raise Exception("Unable to web scrape the job description.")

        except Exception as e:
            print(e)
            st.write("Please try pasting the job description text instead of the URL.")
            st.error(f"Error in Job Details Parsing, {e}")
            return None, None

    @utils.measure_execution_time
    def resume_builder(self, job_details: dict, user_data: dict, is_st=False):
        """
        Builds a resume based on the provided job details and user data.
        Args:
            job_details (dict): A dictionary containing the job description.
            user_data (dict): A dictionary containing the user's resume or work information.
        Returns:
            dict: The generated resume details.
        Raises:
            FileNotFoundError: If the system prompt files are not found.
        """
        try:
            print("\nGenerating Resume Details...")
            if is_st: st.toast("Generating Resume Details...")

            resume_details = dict()

            # Personal Information Section
            if is_st: st.toast("Processing Resume's Personal Info Section...")
            resume_details["personal"] = { 
                "name": user_data["name"], 
                "summary": user_data["summary"]
                }
            st.markdown("**Personal Info Section**")
            st.write(resume_details)

            # Other Sections
            for section in ['work_experience', 'skill_section', 'education', 'certifications']:
                if section not in user_data or not user_data[section]:  # Check if section exists and is not empty
                    continue
                section_log = f"Processing Resume's {section.upper()} Section..."
                if is_st: st.toast(section_log)

                json_parser = JsonOutputParser(pydantic_object=section_mapping[section]["schema"])
                
                prompt = PromptTemplate(
                    template=section_mapping[section]["prompt"],
                    partial_variables={"format_instructions": json_parser.get_format_instructions()}
                    ).format(section_data = json.dumps(user_data[section]), job_description = json.dumps(job_details))

                response = self.llm.get_response(prompt=prompt, expecting_longer_output=True, need_json_output=True)

                # Check for empty sections
                if response is not None and isinstance(response, dict):
                    if section in response:
                        if response[section]:
                            if section == "skill_section":
                                resume_details[section] = [i for i in response['skill_section'] if len(i['skills'])]
                            else:
                                resume_details[section] = response[section]
                
                if is_st:
                    st.markdown(f"**{section.upper()} Section**")
                    st.write(response)

            resume_details['keywords'] = ', '.join(job_details['keywords'])

            
            resume_path = utils.job_doc_name(job_details, self.downloads_dir, "resume")

            utils.write_json(resume_path, resume_details)
            resume_path = resume_path.replace(".json", ".pdf")
            st.write(f"resume_path: {resume_path}")
            
            resume_latex = latex_to_pdf(resume_details, resume_path)
            
            print(resume_latex)

            st.write(f"resume_pdf_path: {resume_path}")

            return resume_path, resume_details
        except Exception as e:
            print(e)
            st.write("Error: \n\n",e)
            return resume_path, resume_details