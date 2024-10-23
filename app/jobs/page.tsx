import React from 'react';

const CandidatePage: React.FC = () => {
  // Mock data for the candidate and their files
  const candidate = {
    name: 'Priyanka A.',
    pictureUrl: 'https://via.placeholder.com/150', // Placeholder image for candidate
    files: [
      {
        id: 1,
        fileName: 'Exercise-1(Priyanka A).docx',
        atsScore: 85, // ATS score in percentage
        summary: 'This is the summary for the first resume.',
      },
      {
        id: 2,
        fileName: 'Exercise-2(Priyanka A).docx',
        atsScore: 90,
        summary: 'This is the summary for the second resume.',
      },
      {
        id: 3,
        fileName: 'Exercise-3(Priyanka A).docx',
        atsScore: 92,
        summary: 'This is the summary for the third resume.',
      },
      {
        id: 4,
        fileName: 'Exercise-4(Priyanka A).docx',
        atsScore: 88,
        summary: 'This is the summary for the fourth resume.',
      },
      {
        id: 5,
        fileName: 'Exercise-5(Priyanka A).docx',
        atsScore: 91,
        summary: 'This is the summary for the fifth resume.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Candidate: {candidate.name}</h1>
          <button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800">
            Upload Files
          </button>
        </div>

        {/* Table for Files */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">File Name</th>
                <th className="text-left px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">ATS Score</th>
                <th className="text-left px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">View Summary</th>
                <th className="text-left px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidate.files.map((file) => (
                <tr key={file.id} className="border-b border-gray-200">
                  <td className="px-6 py-4 text-gray-700">{file.fileName}</td>
                  <td className="px-6 py-4 text-gray-700">{file.atsScore}%</td>
                  <td className="px-6 py-4">
                    {/* View Summary Button */}
                    <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2">
                      <span>View Summary</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9m-9 0H3m9-8v8m0-8H8m4 0h4m-8 0V4m0 0V4m0 0L8 4" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-4">
                      {/* Download Button */}
                      <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2">
                        <span>Download</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-2">
                        <span>Delete</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;
