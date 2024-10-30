"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";

// Define the Candidate, Resume, and ATS_Score interfaces
interface Resume {
  id: number;
  filename: string;
  fileUrl: string;
  uploadedAt: string;
}

interface ATS_Score {
  id: number;
  score: number;
  summary: string;
  createdAt: string;
}

interface Candidate {
  id: number;
  name: string;
  createdAt: string;
  resumes: Resume[];
  scores: ATS_Score[];
}

// Modal styles (using Tailwind for size control)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
};

export default function HomePageContent() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle creating a new candidate
  const handleCreateCandidate = async () => {
    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: candidateName }),
      });

      if (response.ok) {
        alert("Candidate created successfully!");
        setCandidateName("");
        closeModal();
        fetchCandidates(); // Refresh candidate list after adding a new candidate
      } else {
        alert("Failed to create candidate.");
      }
    } catch (error) {
      console.error("Error creating candidate:", error);
    }
  };

  // Fetch candidates from the API
  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      console.log(data); // Log the candidates array to see if it contains valid IDs
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };


  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    } else {
      fetchCandidates(); // Fetch candidates when user is authenticated
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return null;

  return (
    <div className="flex h-screen">
      <aside className="w-1/4 bg-gray-100 p-4 border-r border-gray-300 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">ATS</h1>
          <ul>
            <li className="mb-4">
              <a href="/" className="text-lg text-gray-700 hover:text-black">
                Candidates
              </a>
            </li>
            <li className="mb-4">
              <a href="/settings" className="text-lg text-gray-700 hover:text-black">
                Settings
              </a>
            </li>
          </ul>
        </div>
        {/* User Information and Logout */}
        <div className="mt-auto">
          <p>{session?.user?.name}</p>
          <button onClick={() => signOut()} className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 p-8">
        {/* New Candidate Button in the top-right corner */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Candidates</h1>
          {/* Open modal instead of navigating */}
          <button onClick={openModal} className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800">
            New Candidate
          </button>
        </div>

        {/* Display list of candidates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="relative flex flex-col justify-between items-center bg-white border border-gray-200 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/candidates/${candidate.id}`)} // Navigate to candidate's page
              >
                <div className="flex flex-col items-center mt-6">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700">
                    {candidate.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mt-4">{candidate.name}</h3>
                </div>
                <p className="mt-4 text-gray-500 text-sm">
                  Created on: {new Date(candidate.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p>No candidates available.</p>
          )}
        </div>

        {/* Modal for creating a new candidate */}
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Create a new candidate</h2>
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="border p-2 w-full mb-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button onClick={handleCreateCandidate} className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800">
                Create Candidate
              </button>
              <button onClick={closeModal} className="ml-4 py-2 px-4 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
