import json
import textwrap
import pandas as pd
import streamlit as st
import google.generativeai as genai
from openai import OpenAI
from google.generativeai.types.generation_types import GenerationConfig
from zlm.utils.utils import parse_json_markdown
from zlm.variables import GPT_EMBEDDING_MODEL

class ChatGPT:
    def __init__(self, api_key, model, system_prompt):
        if system_prompt.strip():
            self.system_prompt = {"role": "system", "content": system_prompt}
            print(self.system_prompt)
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    def get_response(self, prompt, expecting_longer_output=False, need_json_output=False):
        user_prompt = {"role": "user", "content": prompt}

        try:
            # TODO: Decide value(temperature, top_p, max_tokens, stop) to get apt response
            completion = self.client.chat.completions.create(
                model=self.model,
                messages = [self.system_prompt, user_prompt],
                temperature=0,
                max_tokens = 4000 if expecting_longer_output else None,
                response_format = { "type": "json_object" } if need_json_output else None
            )

            response = completion.choices[0].message
            content = response.content.strip()
            
            if need_json_output:
                return parse_json_markdown(content)
            else:
                return content
        
        except Exception as e:
            print(e)
            st.error(f"Error in OpenAI API, {e}")
            st.markdown("<h3 style='text-align: center;'>Please try again! Check the log in the dropdown for more details.</h3>", unsafe_allow_html=True)
    
    def get_embedding(self, text, model=GPT_EMBEDDING_MODEL, task_type="retrieval_document"):
        try:
            text = text.replace("\n", " ")
            return self.client.embeddings.create(input = [text], model=model).data[0].embedding
        except Exception as e:
            print(e)