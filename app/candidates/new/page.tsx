export default function NewCandidatePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Create a new candidate
          </h1>
  
          <form method="POST" action="/api/candidates" className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Candidate Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter candidate name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
  
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  