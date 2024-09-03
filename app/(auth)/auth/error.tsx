"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-md shadow-md">
        <h2 className="text-3xl font-bold text-white">Something went wrong.</h2>
        <p className="text-gray-400 mt-4">
          An error occurred while loading the page. Please try again later.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
