"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface to define the candidate data structure
interface Candidate {
  id: number;
  name: string;
}

export default function NoResumePage({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null); // State to store candidate data
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Function to fetch candidate data based on the ID
  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data); // Set the candidate data
      } else {
        console.error('Failed to fetch candidate');
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate(); // Fetch candidate when the component mounts
  }, [candidateId]);

  // Function to handle the redirect to /generators when "Upload Files" is clicked
  const handleUploadFilesClick = () => {
    router.push(`/generators?candidateId=${candidateId}`); // Pass candidateId in the URL as a query param
  };

  if (isLoading) {
    return <p>Loading...</p>; // Display a loading message while fetching data
  }

  return (
    <div className="container mx-auto p-6 text-center">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">All Files for {candidate?.name || 'Candidate'}</h1> {/* Display the candidate name dynamically */}

        <button
          onClick={handleUploadFilesClick}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Upload Files
        </button>
      </div>

      <h2 className="text-2xl font-semibold">No Files Yet</h2>
      <p className="mt-4 text-gray-600">
        You do not have any files yet. Upload one by clicking on the "Upload Files" button.
      </p>

      {/* Go Back Link */}
      <Link href={`/candidates/${candidateId}`} className="text-blue-500 mt-4 block">
        Go Back
      </Link>
    </div>
  );
}
