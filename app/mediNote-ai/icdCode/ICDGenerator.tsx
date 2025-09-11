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

  // State for selecting items (using a Set for unique selections)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Helper function to create a clean, unique ID for each ICD code
  const createItemId = (code: ICDCode): string => {
    // Clean the code by removing special characters and URL encoding
    const cleanCode = code.code.replace(/[&%]/g, '').trim();
    return `${code.system}-${cleanCode}`;
  };

  // Helper function to clean and format ICD codes for display
  const cleanCodeForDisplay = (code: string): string => {
    // Remove URL encoding and special characters that might cause display issues
    return code.replace(/[&%]/g, '').trim();
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      // Dispatch instantly so Visit Summary updates without waiting for effect flush
      if (searchSystem) {
        persistSelection(newSet, searchSystem);
      }
      return newSet;
    });
  };

  // Persist selection and system for Visit Summary consumption
  const persistSelection = (selectedSet: Set<string>, system: string) => {
    try {
      // Create a map for quick lookup
      const codeMap = new Map(icdCodes.map(c => [createItemId(c), c]));
      
      // Get selected details, ensuring no duplicates
      const selectedDetails = Array.from(selectedSet)
        .map((itemId) => {
          const code = codeMap.get(itemId);
          if (!code) return null;
          
          return {
            id: itemId,
            system: code.system,
            code: cleanCodeForDisplay(code.code),
            title: code.title.trim()
          };
        })
        .filter(Boolean) as Array<{id: string; system: string; code: string; title: string}>;

      const payload = {
        system,
        items: selectedDetails,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(`icdSelection:${sessionId}`, JSON.stringify(payload));

      try {
        if (selectedDetails.length > 0) {
          const header = `\n\n## ICD Codes (${system})\n`;
          // Remove duplicates by code before creating lines
          const uniqueDetails = selectedDetails.reduce((acc, item) => {
            if (!acc.some(existing => existing.code === item.code)) {
              acc.push(item);
            }
            return acc;
          }, [] as typeof selectedDetails);
          
          const lines = uniqueDetails.map((it) => `- ${it.code}: ${it.title}`).join('\n');
          const sectionText = header + lines + '\n';
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('icdSelectionUpdated', {
                detail: {
                  sessionId: Number(sessionId),
                  system,
                  items: uniqueDetails,
                  sectionText,
                },
              })
            );
          }
        } else {
          // Clear the section when no items are selected
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('icdSelectionUpdated', {
                detail: {
                  sessionId: Number(sessionId),
                  system,
                  items: [],
                  sectionText: '',
                },
              })
            );
          }
        }
      } catch (error) {
        console.error('Failed to dispatch event:', error);
      }
    } catch (e) {
      console.error('Failed to persist ICD selection', e);
    }
  };

  // Keep localStorage in sync when selection or system changes
  React.useEffect(() => {
    if (searchSystem) {
      persistSelection(selectedItems, searchSystem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, searchSystem, icdCodes, sessionId]);

  // Function to fetch ICD codes (GET /icd/search)
  const fetchIcdCodes = async () => {
    setSearchLoading(true);
    setSearchError(null);
    setIcdCodes([]);
    // Clear previous selections when searching new codes
    setSelectedItems(new Set());
    // Notify listeners immediately that selection cleared
    if (searchSystem) {
      persistSelection(new Set(), searchSystem);
    }
    
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
      
      // Remove any duplicate codes that might come from the API
      const uniqueCodes = data.results.reduce((acc, code) => {
        const key = `${code.system}-${cleanCodeForDisplay(code.code)}`;
        if (!acc.some(existing => `${existing.system}-${cleanCodeForDisplay(existing.code)}` === key)) {
          acc.push(code);
        }
        return acc;
      }, [] as ICDCode[]);
      
      setIcdCodes(uniqueCodes);
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
            session_id: Number(sessionId),
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

  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      try {
        const flag = localStorage.getItem(`visitSummaryEdit:${sessionId}`) === 'true';
        setIsEditMode(flag);
      } catch {}
    };
    // Initial sync
    sync();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { sessionId: number; isEdit: boolean } | undefined;
      if (!detail || detail.sessionId !== Number(sessionId)) {
        // still update from localStorage in case other sessions toggled
        sync();
        return;
      }
      setIsEditMode(detail.isEdit);
    };
    window.addEventListener('visitSummaryEditToggle', handler as EventListener);
    return () => window.removeEventListener('visitSummaryEditToggle', handler as EventListener);
  }, [sessionId]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">ICD Code Generator</h2>

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
            placeholder="e.g., cholera"
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
            placeholder="e.g., 10"
            min="1"
            max="50"
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
            <h4 className="text-md font-semibold mb-2">
              ICD Codes ({selectedItems.size} selected)
            </h4>
            <ul className="list-none space-y-3">
              {icdCodes.map((code) => {
                const itemId = createItemId(code);
                const checkboxId = `${itemId}__select`;
                const isSelected = selectedItems.has(itemId);
                const displayCode = cleanCodeForDisplay(code.code);
                
                return (
                  <li key={itemId} className="border rounded-lg p-3 bg-gray-50">
                    {isEditMode ? (
                      <div className="flex items-start gap-3">
                        <input
                          id={checkboxId}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(itemId)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={checkboxId} className="cursor-pointer flex-1">
                          <div className="font-medium text-gray-900">
                            Code: {displayCode}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {code.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            System: {code.system}
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">
                          Code: {displayCode}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {code.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          System: {code.system}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}  </div>
    </div>
  );
};

export default ICDGenerator;