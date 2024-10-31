"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import * as mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function ModifyResume() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recruiterPrompt, setRecruiterPrompt] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfData, setPdfData] = useState<string | null>(null);
  
  const weights = {
    skills_matching: 30,
    experience: 20,
    education: 10,
    keyword_usage: 15,
    certifications: 10,
    achievements: 10,
    job_stability: 5,
  };

  const searchParams = useSearchParams();
  const api_key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const provider = "GPT";
  const model = "gpt-4o";

  useEffect(() => {
    const candidateId = searchParams.get('candidateId');
    const resumeId = searchParams.get('resumeId');
    const generatedResumeId = searchParams.get('generatedResumeId');

    if (candidateId && resumeId) {
      fetchResumeData(candidateId, resumeId, generatedResumeId);
    } else {
      setError('Invalid candidate or resume ID');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchResumeData = async (candidateId: string, resumeId: string, generatedResumeId: string | null) => {
    try {
      const url = generatedResumeId
        ? `/api/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}&generatedResumeId=${generatedResumeId}`
        : `/api/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      
      const data = await response.json();
      console.log("Fetched Resumefilename:", data.resumefilename);
      setResumeUrl(data.resumeUrl);
      setJobDescription(data.jobDescription);
      setResumeFilename(data.resumefilename);
  
      if (data.resumeUrl) {
        await fetchResumeFile(data.resumeUrl);
      }
    } catch (err) {
      setError('Failed to fetch resume data');
    } finally {
      setLoading(false);
    }
  };  

  const fetchResumeFile = async (resumeUrl: string) => {
    try {
      const response = await fetch(resumeUrl);
      if (!response.ok) throw new Error('Failed to fetch resume file');

      const blob = await response.blob();
      const file = new File([blob], 'resume.pdf', { type: blob.type });
      setResumeFile(file);
    } catch (error) {
      setError('Failed to load resume file');
    }
  };

  const retrieveAndUploadFile = async (pdfPath: string) => {
    try {
      const response = await fetch(pdfPath);
      if (!response.ok) throw new Error("Failed to retrieve generated resume file");

      const fileBlob = await response.blob();
      const file = new File([fileBlob], "generated_resume.pdf", { type: "application/pdf" });
      await uploadGeneratedResume(file);
    } catch (error) {
      console.error("Failed to retrieve or upload the generated resume:", error);
      setErrorMessage("Failed to retrieve or upload the generated resume.");
    }
  };

  const extractText = async (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfDocument = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      let resumeText = "";

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const pageContent = await page.getTextContent();
        const pageText = pageContent.items.map((item: any) => item.str).join(" ");
        resumeText += pageText;
      }
      return resumeText;
    } else if (fileExtension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const docxBuffer = new Uint8Array(arrayBuffer);
      const { value: resumeText } = await mammoth.extractRawText({ arrayBuffer: docxBuffer });
      return resumeText;
    } else {
      throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
    }
  };

  const uploadGeneratedResume = async (generatedFile: File) => {
    if (!generatedFile || !resumeFilename || !jobDescription) {
      setErrorMessage("PDF file, resume filename, or job description is missing.");
      return;
    }
    try {
      const formData = new FormData();
      const candidateId = searchParams.get("candidateId") || "";
      const resumeId = searchParams.get("resumeId") || "";
      formData.append("candidateId", candidateId );
      formData.append("resumeId", resumeId);
      formData.append("jobDescription", jobDescription);
      formData.append("resumeFilename", resumeFilename);
      formData.append("pdf", generatedFile);

      const response = await fetch("/api/upload-generated-resume", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        const createdId = result.createdId;
        const resumeTexts = await extractText(generatedFile);

        const atsResponse = await fetch("/api/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription: jobDescription,
            resumeTexts,
            fileNames: [resumeFilename],
            weights,
            candidateId,
            resumeId: createdId,
            flag: 1,
          }),
        });

        const results = await atsResponse.json();
        if (!results.success) {
          setErrorMessage(results.message);
        } else {
          console.log("Resume uploaded successfully:", result.data);
        }
      } else {
        console.error("Failed to upload resume:", await response.json());
      }      
    } catch (error) {
      console.error("Failed to upload the generated resume:", error);
      setErrorMessage("Failed to upload the generated resume.");
    }
  };

  const handleSubmit = async () => {
    if (!recruiterPrompt || !resumeFile || !jobDescription) {
      setErrorMessage("Please fill all fields and ensure the required files are loaded.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);
    formData.append("recruiter_prompt", recruiterPrompt);
    formData.append("api_key", api_key);
    formData.append("provider", provider);
    formData.append("model", model);
    try {
      const response = await fetch("/api/server", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        const pdfPath = json.filePath;

        if (!pdfPath) {
          setErrorMessage("Error: PDF generation failed.");
          return;
        }

        await retrieveAndUploadFile(pdfPath);
        setPdfData(pdfPath);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || "Failed to generate resume.");
      }
    } catch (error) {
      setErrorMessage("Error submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        Build Resume
      </h1>
      <div className="mb-4">
        <textarea
          value={recruiterPrompt}
          onChange={(e) => setRecruiterPrompt(e.target.value)}
          rows={4}
          className="p-2 block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Enter any additional notes or recruiter prompts here..."
        />
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded"
          disabled={loading}
        >
          {loading ? "Generating Resume..." : "Build Resume"}
        </button>
      </div>
      {errorMessage && <p className="text-red-600 text-center mt-4">{errorMessage}</p>}
      {pdfData && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-center mb-4 text-gray-700">
            Your Generated Resume
          </h3>
          <iframe
            src={pdfData}
            title="Generated Resume"
            className="w-full h-screen border border-gray-300 rounded-lg shadow-sm"
          />
          <div className="flex justify-center mt-4">
            <a
              href={pdfData}
              download="generated_resume.pdf"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
