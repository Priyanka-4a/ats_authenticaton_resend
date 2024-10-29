"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface to define the candidate data structure
interface Candidate {
  id: number;
  name: string;
}

export default function NoGeneratedResumePage({ params }: { params: { id: string; resumeid: string } }) {
  const candidateId = parseInt(params.id);
  const resumeId = parseInt(params.resumeid);
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

  if (isLoading) {
    return <p>Loading...</p>; // Display a loading message while fetching data
  }

  return (
    <div className="container mx-auto p-6 text-center">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">
          Generated Resumes for {candidate?.name || 'Candidate'}
        </h1>
      </div>
      <h2 className="text-2xl font-semibold">No Generated Files Yet</h2>
      <p className="mt-4 text-gray-600">
          You do not have any generated files yet. please select a resume and modify the resume to view files
      </p>

      {/* Go Back Link */}
      <Link href={`/candidates/${candidateId}`} className="text-blue-500 mt-4 block">
        Go Back
      </Link>
    </div>
  );
}
