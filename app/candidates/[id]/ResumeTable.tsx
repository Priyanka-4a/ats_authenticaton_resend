"use client";

import { useState } from 'react';

export default function ResumeTable({ candidate }) {
  const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null); // Track which resume's summary is open

  // Function to handle the view summary button click
  const handleViewSummaryClick = (index: number) => {
    if (openSummaryIndex === index) {
      setOpenSummaryIndex(null); // Close if clicked again
    } else {
      setOpenSummaryIndex(index); // Set the clicked resume's index
    }
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
            const atsScore = candidate.scores[index]?.score || "N/A"; // Assuming score corresponds to resume order
            const summary = candidate.scores[index]?.summary || "No summary available"; // Assuming summary corresponds to resume order
            const [isDropdownOpen, setDropdownOpen] = useState(false); // State to handle dropdown visibility

            return (
              <tr key={resume.id} className="border-b border-gray-200">
                <td className="border p-2">{resume.filename}</td>
                <td className="border p-2">{atsScore}%</td>
                <td className="border p-2">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                <td className="border p-2 relative">
                  {/* Dropdown Trigger Button */}
                  <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Options
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleViewSummaryClick(index)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h8M8 10h8M8 14h8M5 6h.01M5 10h.01M5 14h.01" />
                          </svg>
                          View Summary
                        </button>
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Download
                        </a>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => console.log('Deleting File')}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}

          {/* Show Summary if Open */}
          {openSummaryIndex !== null && (
            <tr>
              <td colSpan={4} className="border p-4 bg-gray-50">
                <h3 className="text-lg font-semibold">Summary for {candidate.resumes[openSummaryIndex].filename}</h3>
                <p className="text-gray-700 whitespace-pre-line mt-2">
                  {candidate.scores[openSummaryIndex]?.summary || "No summary available for this resume."}
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}