"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(); // Redirect users who are not authenticated to the sign-in page
    }
  }, [status]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return null; // Hide page content until user is authenticated
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center">
        Welcome to the ATS Compatibility Checker
      </h1>
      <p className="text-center mt-4">
        You are signed in as {session?.user?.email}
      </p>
    </div>
  );
}
