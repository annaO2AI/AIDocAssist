import React, { useState } from 'react';

// Define the props interface
interface ICDGeneratorProps {
  sessionId: number;
  patientId?: string;
  transcriptionEnd?: boolean;
}

// Define the API response interface for search
interface ICDCode {
  system: string;
  code: string;
  title: string;
}

interface SearchAPIResponse {
  system: string;
  results: ICDCode[];
}

// Define the API response interface for summary
interface SummaryAPIResponse {
  summary_id: number;
  session_id: number;
  summary_text: string;
  icd_system: string;
  icd_codes: string[];
}

const ICDGenerator: React.FC<ICDGeneratorProps> = ({ sessionId }) => {
  // State for search form inputs
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSystem, setSearchSystem] = useState<string>('');
  const [searchLimit, setSearchLimit] = useState<string>('');
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // State for summary form inputs and response
  const [summaryText, setSummaryText] = useState<string>('');
  const [summarySystem, setSummarySystem] = useState<string>('');
  const [summaryResponse, setSummaryResponse] = useState<SummaryAPIResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  // Function to fetch ICD codes (GET /icd/search)
  const fetchIcdCodes = async () => {
    setSearchLoading(true);
    setSearchError(null);
    setIcdCodes([]);
    try {
      const response = await fetch(
        `https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/icd/search?q=${encodeURIComponent(
          searchQuery
        )}&system=${searchSystem}&limit=${searchLimit}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchAPIResponse = await response.json();
      setIcdCodes(data.results);
    } catch (err) {
      setSearchError('Failed to fetch ICD codes. Please try again.');
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery && searchSystem && searchLimit) {
      fetchIcdCodes();
    } else {
      setSearchError('Please fill in all search fields.');
    }
  };

  // Function to generate summary (POST /icd/finalize-summary)
  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryResponse(null);
    try {
      const response = await fetch(
        'https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/icd/finalize-summary',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: Number(sessionId), // Convert to number as per API response
            summary_text: summaryText,
            icd_system: summarySystem,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SummaryAPIResponse = await response.json();
      setSummaryResponse(data);
    } catch (err) {
      setSummaryError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handle generate summary button click
  const handleGenerateSummary = () => {
    if (summaryText && summarySystem) {
      generateSummary();
    } else {
      setSummaryError('Please fill in all summary fields.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">ICD Code Generator</h2>

      {/* Search Form */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold">Search ICD Codes</h3>
        {/* Search Query Input */}
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">
            Search Query
          </label>
          <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1A00"
          />
        </div>

        {/* Search System Dropdown */}
        <div>
          <label htmlFor="searchSystem" className="block text-sm font-medium text-gray-700">
            System
          </label>
          <select
            id="searchSystem"
            value={searchSystem}
            onChange={(e) => setSearchSystem(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a system
            </option>
            <option value="ICD11">ICD11</option>
            <option value="ICD10">ICD10</option>
          </select>
        </div>

        {/* Search Limit Input */}
        <div>
          <label htmlFor="searchLimit" className="block text-sm font-medium text-gray-700">
            Limit
          </label>
          <input
            id="searchLimit"
            type="number"
            value={searchLimit}
            onChange={(e) => setSearchLimit(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2"
            min="1"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {searchLoading ? 'Searching...' : 'Search'}
        </button>

        {/* Search Results */}
        {searchError && <p className="mt-4 text-red-500">{searchError}</p>}
        {icdCodes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold">ICD Codes</h4>
            <ul className="list-disc pl-5">
              {icdCodes.map((code, index) => (
                <>
                <li key={index} className="mt-2">
                <strong> Code</strong>: {code.code}
              </li>
               <li key={index+1} className="mt-2">
                <strong> Title</strong>: {code.title}
                </li>
                </>
              
              ))}
            </ul>
          </div>
        )}
      </div>
    
    </div>
  );
};

export default ICDGenerator;