"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Resume {
  id: number;
  Resumefilename: string;
  uploadedAt: string;
  ResumefileUrl: string;
  JobDescriptionfileUrl: string;
  JobDescription: string;
}

interface ATS_Score {
  score: number;
  summary: string;
}

interface Candidate {
  id: number;
  resumes: Resume[];
  atsScores: ATS_Score[];
}

export default function ResumeTable({ candidate }: { candidate: Candidate }) {
  const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState<number | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleViewSummaryClick = (index: number) => {
    setOpenSummaryIndex(index);
  };

  const handleModifyResumeClick = (candidateId: number, resumeId: number) => {
    router.push(`/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}`);
  };  

  const handleviewmodifiedresumesClick = (candidateId: number, resumeId: number) => {
    router.push(`/candidates/${candidateId}/${resumeId}`)
  };

  const handleJobDescriptionClick = async (index: number) => {
    setShowJobDescription(index);
    setLoading(true);

    const jobDescriptionUrl = candidate.resumes[index].JobDescriptionfileUrl;
    try {
      const response = await fetch(jobDescriptionUrl);
      if (response.ok) {
        const text = await response.text();
        setJobDescriptionText(text);
      } else {
        setJobDescriptionText("Failed to load Job Description");
      }
    } catch (error) {
      setJobDescriptionText("Error fetching Job Description");
    }
    setLoading(false);
  };

  const handleCloseSummaryModal = () => {
    setOpenSummaryIndex(null);
  };

  const handleCloseJobDescriptionModal = () => {
    setShowJobDescription(null);
    setJobDescriptionText("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resumes and ATS Scores</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 text-left">Filename</th>
            <th className="border p-2 text-left">ATS Score</th>
            <th className="border p-2 text-left">Created At</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidate.resumes.map((resume, index) => {
            const atsScore = candidate.atsScores[index]?.score || "N/A";
            const summary = candidate.atsScores[index]?.summary || "No summary available";
            const [isDropdownOpen, setDropdownOpen] = useState(false);

            return (
              <tr key={resume.id} className="border-b border-gray-200">
                <td className="border p-2">{resume.Resumefilename}</td>
                <td className="border p-2">{atsScore}%</td>
                <td className="border p-2">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                <td className="border p-2 relative">
                  <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Options
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleViewSummaryClick(index)}
                        >
                          View Summary
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleJobDescriptionClick(index)}
                        >
                          View Job Description
                        </button>
                        <a
                          href={resume.ResumefileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download Resume
                        </a>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleModifyResumeClick(candidate.id, resume.id)}
                        >
                          Build Resume
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleviewmodifiedresumesClick(candidate.id, resume.id)}
                        >
                          View Modified Resumes
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => console.log("Deleting File")}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {openSummaryIndex !== null && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
      {/* Close Button in Top-Right Corner */}
      <button
        onClick={handleCloseSummaryModal}
        className="absolute top-2 right-2 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
      >
        Close
      </button>
      <h3 className="text-md font-semibold mb-1">Summary</h3>
      <p className="text-sm text-gray-600 whitespace-pre-line">
        {candidate.atsScores[openSummaryIndex]?.summary || "No summary available for this resume."}
      </p>
    </div>
  </div>
)}
{showJobDescription !== null && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
      {candidate.resumes[showJobDescription]?.JobDescriptionfileUrl && (
        <a
          href={candidate.resumes[showJobDescription]?.JobDescriptionfileUrl}
          download
          className="absolute top-2 right-20 px-4 py-1 bg-black text-white rounded-full hover:bg-green-700 text-sm"
        >
          Download
        </a>
      )}
      <button
        onClick={handleCloseJobDescriptionModal}
        className="absolute top-2 right-2 ml-4 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
      >
        Close
      </button>
      <h3 className="text-md font-semibold mb-1">Job Description</h3>
      <p className="text-sm text-gray-700 mb-4">
        {candidate.resumes[showJobDescription]?.JobDescription || "No Job Description available for this resume."}
      </p>
    </div>
  </div>
)}
    </div>
  );
}
