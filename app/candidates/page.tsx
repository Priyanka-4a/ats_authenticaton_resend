// "use client";
// import { useState, useEffect } from "react";
// import Modal from "react-modal";

// // Define the Candidate interface
// interface Candidate {
//   id: number;
//   name: string;
//   createdAt: string;
// }

// // Modal styles (using Tailwind for size control)
// const customStyles = {
//   content: {
//     top: "50%",
//     left: "50%",
//     right: "auto",
//     bottom: "auto",
//     marginRight: "-50%",
//     transform: "translate(-50%, -50%)",
//     maxHeight: "80vh", // Allows scrolling if the content is too large
//     overflowY: "auto",  // Enable vertical scrolling
//     width: "80vw",      // Make modal bigger
//     padding: "0",
//     borderRadius: "12px",
//   },
// };

// export default function CandidatesPage() {
//   const [candidates, setCandidates] = useState<Candidate[]>([]);
//   const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Percentage input values
//   const [weights, setWeights] = useState({
//     skills_matching: 40,
//     experience: 30,
//     education: 20,
//     keyword_usage: 10,
//     certifications: 0,
//     achievements: 0,
//     job_stability: 0,
//     cultural_fit: 0,
//   });
//   const [totalWeight, setTotalWeight] = useState<number>(100);

//   const fetchCandidates = async () => {
//     const res = await fetch("/api/candidates");
//     const data = await res.json();
//     setCandidates(data);
//   };

//   useEffect(() => {
//     fetchCandidates();
//   }, []);

//   const handleWeightChange = (criteria: keyof typeof weights, value: number) => {
//     const updatedWeights = { ...weights, [criteria]: value };
//     const newTotalWeight = Object.values(updatedWeights).reduce((sum, weight) => sum + weight, 0);
//     setWeights(updatedWeights);
//     setTotalWeight(newTotalWeight);
//   };

//   const openModal = (candidate: Candidate) => {
//     setSelectedCandidate(candidate);
//     setIsModalOpen(true);
//   };
//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedCandidate(null);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-white shadow-lg p-6">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">Candidates</h2>
//         <p className="text-gray-600">Select a candidate to view profile and ATS compatibility.</p>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-10">
//         <h1 className="text-3xl font-semibold text-gray-800 mb-8">Candidate List</h1>

//         {/* 3xN Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {candidates.map((candidate) => (
//             <div
//               key={candidate.id}
//               className="relative flex flex-col justify-between items-center bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 aspect-square cursor-pointer"
//               onClick={() => openModal(candidate)}  // Open modal when clicking a candidate
//             >
//               <div className="flex flex-col items-center mt-6">
//                 <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700">
//                   {candidate.name.charAt(0)}
//                 </div>
//                 <h3 className="text-xl font-medium text-gray-900 mt-4">{candidate.name}</h3>
//               </div>
//               <p className="absolute bottom-4 text-gray-500 text-sm">
//                 Created on: {new Date(candidate.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Modal for candidate profile and ATS results */}
//         <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
//           {selectedCandidate && (
//             <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
//               <h2 className="text-3xl font-semibold text-gray-800 mb-6">
//                 Candidate Profile: {selectedCandidate.name}
//               </h2>

//               {/* File Upload Section */}
//               <div className="grid grid-cols-2 gap-4 mb-8">
//                 <div>
//                   <label className="block mb-2 text-gray-700">Upload Resume</label>
//                   <input
//                     type="file"
//                     accept=".pdf,.docx"
//                     className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-2 text-gray-700">Upload Job Description</label>
//                   <input
//                     type="file"
//                     accept=".pdf,.docx"
//                     className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
//                   />
//                 </div>
//               </div>

//               {/* Percentage Inputs */}
//               <div className="mb-6">
//                 <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">Customize Criteria for ATS Score Calculation (Total must be 100%)</h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                   {Object.keys(weights).map((key) => (
//                     <div key={key} className="mb-4">
//                       <label className="block text-gray-700 mb-1 capitalize">
//                         {key.replace("_", " ")}: {weights[key as keyof typeof weights]}%
//                       </label>
//                       <input
//                         type="number"
//                         min="0"
//                         max="100"
//                         value={weights[key as keyof typeof weights]}
//                         onChange={(e) =>
//                           handleWeightChange(key as keyof typeof weights, parseInt(e.target.value))
//                         }
//                         className="w-full border rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
//                         required
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <p className="font-semibold text-indigo-500 text-center">
//                   Total Weight: {totalWeight}%
//                 </p>
//                 {totalWeight !== 100 && (
//                   <p className="text-red-600 text-center">Total weight must be 100%</p>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end space-x-4 mt-6">
//                 <button
//                   disabled={totalWeight !== 100}
//                   className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Generate Score
//                 </button>
//                 <button
//                   onClick={closeModal}
//                   className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }


