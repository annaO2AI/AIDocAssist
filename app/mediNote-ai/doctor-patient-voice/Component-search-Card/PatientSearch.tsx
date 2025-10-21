import React from "react";
import ViewPatientList from "./../ViewPatientList";

export interface PatientCardProps {
  patient_id: number;
  name: string;
  voice_file: string;
  exists: boolean;
}

interface PatientSearchProps {
  /** Current search query for patients */
  searchQuery: string;
  /** Callback when the input changes */
  onSearchQueryChange: (value: string) => void;
  /** Callback when the form is submitted (button or Enter) */
  onSubmit: (e: React.FormEvent) => void;
  /** Callback for Enter key inside the input (optional, same as onSubmit) */
  onEnterKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** True while the patient API call is in flight */
  loading: boolean;
  /** Error message (if any) */
  error: string | null;
  /** Patients that have been fetched */
  patients: PatientCardProps[];
  /** Whether the patient-list should be rendered (controlled by parent) */
  showPatientList: boolean;
  /** Callback that starts a session for a patient (receives patientId) */
  handleStartCon: (patientId: number) => void;
  /** List of selected patient IDs */
  selectedPatientIds: number[]; // Added prop
  /** Callback to handle patient selection */
  onPatientSelect: (patientId: number) => void; // Added prop
}

export default function PatientSearch({
  searchQuery,
  onSearchQueryChange,
  onSubmit,
  onEnterKey,
  loading,
  error,
  patients,
  showPatientList,
  handleStartCon,
  selectedPatientIds,
  onPatientSelect,
}: PatientSearchProps) {
  // Filter patients based on searchQuery
  const filteredPatients = searchQuery.trim()
    ? patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  return (
    <div className="patientSearch w-full searchPatients-bg py-6 px-6 pt-16 h-full relative z-10">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 top-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block h-[50px] w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search patients by ID or name"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value.trim())}
            onKeyDown={onEnterKey}
          />
        </div>
      </form>

      {/* ---- Feedback UI ---- */}
      <div className="w-full h-full patent-listAuto mt-3">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            Searching for patient...
          </div>
        )}

        {error && <div className="p-4 text-center text-red-500">{error}</div>}

        {!loading && !error && patients.length === 0 && !searchQuery.trim() && (
          <div className="p-4 text-center text-gray-500">
            No patients available
          </div>
        )}

        {!loading && !error && patients.length > 0 && filteredPatients.length === 0 && searchQuery.trim() && (
          <div className="p-4 text-center text-gray-500">
            No patients found for: {searchQuery}
          </div>
        )}

        {patients.length > 0 && showPatientList && (
          <ViewPatientList
            patients={filteredPatients}
            handleStartCon={handleStartCon}
            selectedPatientIds={selectedPatientIds} // Pass selected IDs
            onPatientSelect={onPatientSelect} // Pass selection handler
          />
        )}
      </div>
    </div>
  );
}