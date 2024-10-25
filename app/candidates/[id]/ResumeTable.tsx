"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Resume {
  id: number;
  Resumefilename: string;
  uploadedAt: string;
  ResumefileUrl: string;
  JobDescriptionfileUrl: string;
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
    if (openSummaryIndex === index) {
      setOpenSummaryIndex(null);
    } else {
      setOpenSummaryIndex(index);
    }
  };

  const handleModifyResumeClick = (resumeUrl: string, jobUrl: string) => {
    // Redirect to the modify page with resumeUrl and jobUrl as query parameters
    router.push(`/modifyresume?resumeUrl=${encodeURIComponent(resumeUrl)}&jobUrl=${encodeURIComponent(jobUrl)}`);
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

  const handleCloseModal = () => {
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
            <th className="border p-2 text-left">Job Description</th>
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
                <td className="border p-2">
                  <button
                    className="text-blue-500 underline"
                    onClick={() => handleJobDescriptionClick(index)}
                  >
                    View
                  </button>
                </td>
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
                        <a
                          href={resume.ResumefileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download
                        </a>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleModifyResumeClick(resume.ResumefileUrl, resume.JobDescriptionfileUrl)}
                        >
                          Modify Resume
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
          {openSummaryIndex !== null && (
            <tr>
              <td colSpan={4} className="border p-4 bg-gray-50">
                <h3 className="text-lg font-semibold">Summary for {candidate.resumes[openSummaryIndex].Resumefilename}</h3>
                <p className="text-gray-700 whitespace-pre-line mt-2">
                  {candidate.atsScores[openSummaryIndex]?.summary || "No summary available for this resume."}
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showJobDescription !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Job Description</h2>
            <p className="text-gray-700 mb-4">
              {loading ? "Loading..." : jobDescriptionText || "No Job Description available."}
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
