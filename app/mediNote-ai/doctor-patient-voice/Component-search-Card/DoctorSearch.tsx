// DoctorSearch.tsx
import React from "react";
import { doctor } from "../../types";

interface DoctorSearchProps {
  /** Current search query for doctors */
  doctorSearch: string;
  /** Callback when the input changes */
  onDoctorSearchChange: (value: string) => void;
  /** Callback when the user presses “Search” or Enter */
  onSearchDoctors: () => void;
  /** True while the API call is in flight */
  doctorSearching: boolean;
  /** Error message (if any) */
  doctorError: string | null;
  /** List of doctors returned from the API */
  doctorResults: doctor[];
  /** Currently selected doctor (null = none) */
  selectedDoctor: doctor | null;
  /** Callback when a doctor card is clicked */
  onSelectDoctor: (doc: doctor) => void;
  /** Optional – fired when the user presses Enter inside the input */
  onEnterKey?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function DoctorSearch({
  doctorSearch,
  onDoctorSearchChange,
  onSearchDoctors,
  doctorSearching,
  doctorError,
  doctorResults,
  selectedDoctor,
  onSelectDoctor,
  onEnterKey,
}: DoctorSearchProps) {
  return (
    <div className="SearchDoctor w-full py-6 px-6 pb-0 relative z-10">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative w-full ">
          <input
            type="text"
            className="block h-[50px] w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search doctor by ID or name"
            value={doctorSearch}
            onChange={(e) => {
              onDoctorSearchChange(e.target.value);
              onSearchDoctors();
            }}
            onKeyDown={onEnterKey}
          />
        </div>
        {/* <button
          type="button"
          onClick={onSearchDoctors}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[50px]"
        >
          {doctorSearching ? "Searching..." : "Search"}
        </button> */}
      </div>

      {/* ---- Error message ---- */}
      {doctorError && <div className="text-sm text-red-600">{doctorError}</div>}

      {/* ---- Results list ---- */}
      {doctorResults.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 DoctorResultslist ">
          {doctorResults.map((doc) => {
            const initials = `${doc.first_name.charAt(0)}${doc.last_name.charAt(
              0
            )}`.toUpperCase();
            const isSelected = selectedDoctor?.id === doc.id;

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoctor(doc)}
                className={`w-full text-left hover:bg-blue-500 px-4 py-2 rounded-md ${
                  isSelected ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                <span className="flex flex-col gap-2">
                  <span className="flex gap-2 items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white text-sm font-semibold">
                      {initials}
                    </div>
                    <span className="flex flex-col">
                      <span className="font-medium text-lg">
                        {doc.first_name} {doc.last_name}
                      </span>
                      <span className="text-sm">Doctor ID: {doc.id}</span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ---- Selected doctor summary ---- */}
      {selectedDoctor && (
        <div className="mb-6 text-sm text-gray-700">
          Selected doctor:{" "}
          <span className="font-semibold">
            {selectedDoctor.first_name} {selectedDoctor.last_name}
          </span>{" "}
          (ID: {selectedDoctor.id})
        </div>
      )}
    </div>
  );
}