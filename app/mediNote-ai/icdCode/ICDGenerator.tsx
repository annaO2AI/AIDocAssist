import React, { useState, useEffect, useCallback } from 'react';

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

// Enhanced interface for stored ICD codes
interface StoredICDCode {
  id: string;
  system: string;
  code: string;
  title: string;
  selectedAt: string;
}

interface ICDSelection {
  system: string;
  items: StoredICDCode[];
  updatedAt: string;
}

const ICDGenerator: React.FC<ICDGeneratorProps> = ({ sessionId }) => {
  // State for search form inputs
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSystem, setSearchSystem] = useState<string>('');
  const [searchLimit, setSearchLimit] = useState<string>('10');
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // State for summary form inputs and response
  const [summaryText, setSummaryText] = useState<string>('');
  const [summarySystem, setSummarySystem] = useState<string>('');
  const [summaryResponse, setSummaryResponse] = useState<SummaryAPIResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  // Enhanced state management for selected items
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [persistentICDCodes, setPersistentICDCodes] = useState<StoredICDCode[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Helper function to create a clean, unique ID for each ICD code
  const createItemId = (code: ICDCode): string => {
    const cleanCode = code.code.replace(/[&%]/g, '').trim();
    return `${code.system}-${cleanCode}`;
  };

  // Helper function to clean and format ICD codes for display
  const cleanCodeForDisplay = (code: string): string => {
    return code.replace(/[&%]/g, '').trim();
  };

  // Load persistent ICD codes from localStorage on component mount
  const loadPersistentICDCodes = useCallback(() => {
    try {
      const stored = localStorage.getItem(`icdSelection:${sessionId}`);
      if (stored) {
        const parsed: ICDSelection = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          setPersistentICDCodes(parsed.items);
          // Set the system from persistent data
          if (parsed.system && !searchSystem) {
            setSearchSystem(parsed.system);
          }
          return parsed.items;
        }
      }
    } catch (error) {
      console.error('Failed to load persistent ICD codes:', error);
    }
    return [];
  }, [sessionId, searchSystem]);

  // Save persistent ICD codes to localStorage
  const savePersistentICDCodes = useCallback((codes: StoredICDCode[], system: string) => {
    try {
      const payload: ICDSelection = {
        system,
        items: codes,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`icdSelection:${sessionId}`, JSON.stringify(payload));
      
      // Dispatch event for Summary Generator
      if (typeof window !== 'undefined') {
        const sectionText = codes.length > 0 
          ? `\n\n## ICD Codes \n${codes.map(code => `- ${code.code}: ${code.title} - (${system})`).join('\n')}\n`
          : '';
        
        window.dispatchEvent(
          new CustomEvent('icdSelectionUpdated', {
            detail: {
              sessionId: Number(sessionId),
              system,
              items: codes,
              sectionText,
            },
          })
        );
      }
    } catch (error) {
      console.error('Failed to save persistent ICD codes:', error);
    }
  }, [sessionId]);

  // Initialize persistent codes on mount
  useEffect(() => {
    loadPersistentICDCodes();
  }, [loadPersistentICDCodes]);

  // Update selected items when persistent codes change
  useEffect(() => {
    const selectedIds = new Set(persistentICDCodes.map(code => code.id));
    setSelectedItems(selectedIds);
  }, [persistentICDCodes]);

  // Listen for edit mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sync = () => {
      try {
        const flag = localStorage.getItem(`visitSummaryEdit:${sessionId}`) === 'true';
        setIsEditMode(flag);
      } catch (error) {
        console.error('Failed to sync edit mode:', error);
      }
    };
    
    sync();
    
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { sessionId: number; isEdit: boolean } | undefined;
      if (!detail || detail.sessionId !== Number(sessionId)) {
        sync();
        return;
      }
      setIsEditMode(detail.isEdit);
    };
    
    window.addEventListener('visitSummaryEditToggle', handler as EventListener);
    return () => window.removeEventListener('visitSummaryEditToggle', handler as EventListener);
  }, [sessionId]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      const code = icdCodes.find(c => createItemId(c) === itemId);
      
      if (!code) return newSet;
      
      if (newSet.has(itemId)) {
        // Remove from selection and persistent storage
        newSet.delete(itemId);
        const updatedPersistent = persistentICDCodes.filter(pc => pc.id !== itemId);
        setPersistentICDCodes(updatedPersistent);
        savePersistentICDCodes(updatedPersistent, searchSystem);
      } else {
        // Add to selection and persistent storage
        newSet.add(itemId);
        const storedCode: StoredICDCode = {
          id: itemId,
          system: code.system,
          code: cleanCodeForDisplay(code.code),
          title: code.title.trim(),
          selectedAt: new Date().toISOString()
        };
        
        // Check if already exists in persistent storage (avoid duplicates)
        const existingIndex = persistentICDCodes.findIndex(pc => pc.id === itemId);
        let updatedPersistent: StoredICDCode[];
        
        if (existingIndex >= 0) {
          // Update existing
          updatedPersistent = [...persistentICDCodes];
          updatedPersistent[existingIndex] = storedCode;
        } else {
          // Add new
          updatedPersistent = [...persistentICDCodes, storedCode];
        }
        
        setPersistentICDCodes(updatedPersistent);
        savePersistentICDCodes(updatedPersistent, searchSystem);
      }
      
      return newSet;
    });
  };

  // Clear all selected items
  const clearAllSelections = () => {
    setSelectedItems(new Set());
    setPersistentICDCodes([]);
    savePersistentICDCodes([], searchSystem);
  };

  // Remove specific item from persistent storage
  const removeFromPersistent = (itemId: string) => {
    const updatedPersistent = persistentICDCodes.filter(code => code.id !== itemId);
    setPersistentICDCodes(updatedPersistent);
    savePersistentICDCodes(updatedPersistent, searchSystem);
    
    // Also remove from current selection if present
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

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

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className='flex justify-between items-center mb-6'>
        <h2 className="text-xl font-bold text-gray-800">ICD Code Generator</h2>
        <button 
          className='p-2 hover:bg-gray-100 rounded-full transition-colors' 
          onClick={() => window.dispatchEvent(new CustomEvent('icdGeneratorClose', { detail: { sessionId } }))}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z" fill="#34334B"/>
          </svg>
        </button>
      </div>

      {/* Selected ICD Codes Summary */}
      {/* {persistentICDCodes.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-blue-800">
              Selected ICD Codes ({persistentICDCodes.length})
            </h3>
            <button
              onClick={clearAllSelections}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {persistentICDCodes.map((code) => (
              <div key={code.id} className="flex justify-between items-start bg-white p-2 rounded border">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {code.code}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {code.title}
                  </div>
                </div>
                <button
                  onClick={() => removeFromPersistent(code.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="space-y-4 mb-8">
        {/* Search Query Input */}
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
            Search ICD Code / Diagnostics
          </label>
          <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., cholera"
          />
        </div>
        
        <div className='flex gap-3'>
          {/* Search System Dropdown */}
          <div className='w-full'>
            <label htmlFor="searchSystem" className="block text-sm font-medium text-gray-700 mb-1">
              ICD Code System
            </label>
            <select
              id="searchSystem"
              value={searchSystem}
              onChange={(e) => setSearchSystem(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select a system
              </option>
              <option value="ICD11">ICD11</option>
              <option value="ICD10">ICD10</option>
            </select>
          </div>

          {/* Search Limit Input */}
          <div className='w-full'>
            <label htmlFor="searchLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Limit Results
            </label>
            <input
              id="searchLimit"
              type="number"
              value={searchLimit}
              onChange={(e) => setSearchLimit(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="1"
              max="50"
            />
          </div>
        </div>
        
        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {searchLoading ? 'Searching...' : 'Search'}
        </button>

        {/* Search Results */}
        {searchError && <p className="text-red-500 text-sm">{searchError}</p>}
        
        {icdCodes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-3 text-gray-800">
              Search Results
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {icdCodes.map((code) => {
                const itemId = createItemId(code);
                const checkboxId = `${itemId}__select`;
                const isSelected = selectedItems.has(itemId);
                const displayCode = cleanCodeForDisplay(code.code);
                const isPersistent = persistentICDCodes.some(pc => pc.id === itemId);
                
                return (
                  <div key={itemId} className={`border rounded-lg p-3 ${isPersistent ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
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
                          {isPersistent && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              Already selected
                            </div>
                          )}
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
                        {isPersistent && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Selected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!isEditMode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Enable Edit Summary mode to select/deselect ICD codes.
          </p>
        </div>
      )}
    </div>
  );
};

export default ICDGenerator;