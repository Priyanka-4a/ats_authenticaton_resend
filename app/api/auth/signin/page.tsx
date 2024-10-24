"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const result = await signIn("email", { email, callbackUrl: "/" });
      if (!result?.ok) {
        throw new Error("Sign-in request failed.");
      }
      setSuccessMessage("Please check your email to confirm and login.");
    } catch (err) {
      setError("Failed to send sign-in email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Sign In
        </h2>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="name@example.com"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">
              {successMessage}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Sending..." : "Sign in with Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
