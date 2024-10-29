"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';  
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { ATSCompatibilityResult, Weights } from "@/types";
import * as mammoth from "mammoth";

// Set the worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function AtsCompatibilityCheckerApp() {
  const [weights, setWeights] = useState<Weights>({});
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [resumeFiles, setResumeFiles] = useState<FileList | null>(null); 
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [atsCompatibilityResults, setAtsCompatibilityResults] = useState<ATSCompatibilityResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useFileUpload, setUseFileUpload] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);  // Modal state
  const [newCriteria, setNewCriteria] = useState<string>("");  // Track the new category to be added
  const [newWeight, setNewWeight] = useState<number | string>(""); // Track the new weight

  const searchParams = useSearchParams(); 
  const router = useRouter();

  // List of criteria options
  const criteriaOptions = [
    { label: "Select criteria", value: "" },
    { label: "Skills Matching", value: "skills_matching" },
    { label: "Experience", value: "experience" },
    { label: "Education", value: "education" },
    { label: "Keyword Usage", value: "keyword_usage" },
    { label: "Certifications", value: "certifications" },
    { label: "Achievements", value: "achievements" },
    { label: "Job Stability", value: "job_stability" },
    { label: "Cultural Fit", value: "cultural_fit" },
  ];

  // Function to handle adding new criteria
  const handleAddCriteria = () => {
    const weightValue = Number(newWeight);
    
    if (!newCriteria || newWeight === "" || weightValue <= 0 || weightValue > 100) {
      setErrorMessage("Invalid criteria or weight must be between 1 and 100.");
      return;
    }

    const currentTotalWeight = totalWeight + weightValue;
    
    if (currentTotalWeight > 100) {
      setErrorMessage("Total weight cannot exceed 100%");
      return;
    }

    if (weights[newCriteria]) {
      setErrorMessage("This criteria has already been added.");
      return;
    }

    const updatedWeights = { ...weights, [newCriteria]: weightValue };
    setWeights(updatedWeights);
    setTotalWeight(currentTotalWeight);
    setShowModal(false); // Close the modal
    setNewCriteria(""); // Reset the form fields
    setNewWeight("");
    setErrorMessage(null); // Clear any existing error
  };

  // Function to handle deleting a criteria
  const handleDeleteCriteria = (criteria: keyof Weights) => {
    const { [criteria]: removed, ...updatedWeights } = weights;
    const newTotalWeight = totalWeight - removed;

    setWeights(updatedWeights);
    setTotalWeight(newTotalWeight);
  };

  // Function to handle clearing all criteria
  const handleClearAll = () => {
    setWeights({});
    setTotalWeight(0);
  };

  // Function to handle resume file upload
  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setResumeFiles(files); 
  };

  // Function to handle job description file upload
  const handleJobDescriptionFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setJobDescriptionFile(file); 
  };

  // Extract resume and JobDescription text from uploaded files
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

  const handleSubmit = async () => {
    if (!resumeFiles || resumeFiles.length === 0 || (!jobDescription && !jobDescriptionFile)) {
      setErrorMessage("Please upload one or more resumes and provide the job description.");
      return;
    }

    if (totalWeight !== 100) {
      setErrorMessage("Total weight must equal 100%");
      return;
    }
  
    setIsLoading(true);
    setErrorMessage(null);
  
    try {
      let finalJobDescription = jobDescription;
      let jobFileBuffer = null;
      let jobFileName = null;
  
      if (jobDescriptionFile) {
        finalJobDescription = await extractText(jobDescriptionFile);
        const arrayBuffer = await jobDescriptionFile.arrayBuffer();
        jobFileBuffer = Buffer.from(arrayBuffer).toString("base64");
        jobFileName = jobDescriptionFile.name;
      }
  
      // Get candidateId from the URL query parameters
      let candidateId = searchParams.get("candidateId");
  
      const resumeUploads = [];
  
      for (let i = 0; i < resumeFiles.length; i++) {
        const resumeFile = resumeFiles[i];
        const fileBuffer = await resumeFile.arrayBuffer();
        const base64FileBuffer = Buffer.from(fileBuffer).toString("base64");
  
        // Upload both resume and job description
        const uploadResponse = await fetch("/api/upload-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: resumeFile.name,
            fileBuffer: base64FileBuffer,
            candidateId,
            jobDescription: finalJobDescription,
            JobBuffer: jobFileBuffer,
            Jobfilename: jobFileName
          }),
        });
  
        if (!uploadResponse.ok) {
          throw new Error(`Error uploading resume: ${resumeFile.name}`);
        }
  
        const uploadResult = await uploadResponse.json();
        console.log("Uploaded resume and job description:", uploadResult.fileUrl);
        console.log("Resume ID:", uploadResult.resumeId);
  
        const resumeText = await extractText(resumeFile);
        resumeUploads.push({
          text: resumeText,
          fileName: resumeFile.name,
          resumeId: uploadResult.resumeId,
        });
      }
      
      const resumeTexts = resumeUploads.map((resume) => resume.text);
      const fileNames = resumeUploads.map((resume) => resume.fileName);
      const resumeId = resumeUploads.map((resume) => resume.resumeId);
  
      const atsResponse = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: finalJobDescription,
          resumeTexts,
          fileNames,
          weights,
          candidateId,
          resumeId,
          flag: 0,
        }),
      });
  
      if (!atsResponse.ok) {
        throw new Error("Error processing ATS compatibility");
      }
  
      const atsResult = await atsResponse.json();
      setAtsCompatibilityResults(atsResult.atsCompatibilityResults);
  
    } catch (error) {
      console.error("Error during submission:", error);
      setErrorMessage("Failed to process ATS check. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-black-600">
        ATS Compatibility Checker 📑
      </h1>

      {/* Modal for Adding Criteria */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Add New Criteria</h3>
            <select
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              className="border p-2 rounded mb-4 w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {criteriaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              min="0"
              max="100"
              step="1"
              placeholder="Enter weight"
              className="border p-2 rounded mb-4 w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            />
            <div className="flex justify-between">
              <button
                onClick={handleAddCriteria}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Add Criteria
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
            {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
          </div>
        </div>
      )}

      {/* File Upload and Job Description Section */}
      <div className="bg-white shadow-lg rounded-lg p-10 mb-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-8 text-gray-700 text-center">
          Upload Resumes and Job Description
        </h3>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Upload Resumes</label>
          <input
            type="file"
            accept=".pdf,.docx"
            multiple // Allow multiple files
            onChange={handleResumeUpload}
            className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Job Description</label>

          {useFileUpload ? (
            // Job Description File Upload
            <div>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleJobDescriptionFileUpload}
                className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          ) : (
            // Job Description Textarea
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="p-2 block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Enter job description here..."
            />
          )}

          {/* Toggle between file upload and textarea */}
          <div className="w-full flex items-center justify-center mt-4">
            <button
              className="text-sm underline"
              onClick={() => {
                setUseFileUpload(!useFileUpload);
              }}
            >
              {useFileUpload
                ? "Prefer typing? Switch to copy/pasting your job description instead."
                : "Have a file? Upload your job description directly instead."}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-center mb-4">{errorMessage}</p>
        )}
      </div>

      {/* Add Criteria Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
        >
          Add Criteria
        </button>
      </div>

      {/* Weights Summary Section */}
      <div className="bg-white shadow-lg rounded-lg p-10 mt-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-8 text-gray-700 text-center">
          Current Criteria and Weights
        </h3>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.keys(weights).map((key) => (
            <div key={key} className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 mb-1 capitalize">
                {key.replace("_", " ")}: {weights[key as keyof Weights]}%
              </label>
              <button
                onClick={() => handleDeleteCriteria(key as keyof Weights)}
                className="bg-black text-white px-2 py-1 rounded hover:bg-gray-700 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <p className="font-semibold text-indigo-500 text-center">
          Total Weight: {totalWeight}%
        </p>
        {totalWeight !== 100 && (
          <p className="text-red-600 text-center">Total weight must be 100%</p>
        )}

        {/* Clear All Criteria Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleClearAll}
            className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
          >
            Clear All Criteria
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
          disabled={isLoading}
        >
          {isLoading
            ? "Checking Compatibility..."
            : "Check ATS Compatibility"}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center my-8">
          <div className="w-16 h-16 border-4 border-dashed border-indigo-600 rounded-full animate-spin"></div>
          <p className="ml-4 text-lg text-indigo-600 text-center">
            Checking ATS compatibility, please wait...
          </p>
        </div>
      )}

        {(atsCompatibilityResults?.length ?? 0) > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 text-center">
            ATS Compatibility Results
          </h3>
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4">
            {atsCompatibilityResults.map((result, index) => {
              const formattedSummary = result.summary.split(/\d+\./).filter(Boolean);

              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mt-4 space-y-6">
                    {formattedSummary.map((section, sectionIndex) => {
                      const cleanedSection = section.replace(/\*\*/g, "").trim();
                      return (
                        <div key={sectionIndex}>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {sectionIndex === 0 ? "ATS Score" :
                              sectionIndex === 1 ? "Suggestions for Improvement" :
                              sectionIndex === 2 ? "Suggestions to Improve" :
                              `Section ${sectionIndex + 1}`}
                          </h4>
                          <div className="text-gray-600 whitespace-pre-line">
                            {cleanedSection.split("- ").map((line, lineIndex) => (
                              <p key={lineIndex} className="mb-2">
                                - {line.trim()}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
