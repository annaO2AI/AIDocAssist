import React from "react";

interface PatientCardProps {
  patient_id: number;
  name: string;
  voice_file: string;
  exists: boolean;
}

interface ViewPatientListProps {
  patients: PatientCardProps[];
  handleStartCon: (id: number) => void;
}

const ViewPatientList = ({ patients, handleStartCon }: ViewPatientListProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 patient-list space-y-4">
      {patients.map((patient) => {
        const handlePlayAudio = () => {
          const audio = new Audio(patient.voice_file);
          audio.play().catch((error) => console.error("Error playing audio:", error));
        };

        const initials = patient.name
          .split(" ")
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("");

        return (
          <div
            key={patient.patient_id}
            className="max-w-md rounded-lg overflow-hidden shadow-sm bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="px-12 py-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white text-lg font-semibold">
                    {initials}
                  </div>
                  <div className="font-bold text-xl text-gray-800 mb-2">
                    {patient.name}
                  </div>
                </div>
                <div className="text-gray-600 text-sm py-1">
                  <span className="ot-title font-bold">Patient ID: </span>
                  <span className="osubtitle">{patient.patient_id}</span>
                </div>
                <div className="text-gray-600 text-sm py-1">
                  <span className="ot-title font-bold">Patient Voice Exists: </span>
                  <span className="osubtitle">{patient.exists ? "Exists" : "Not exists"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`inline-block px-0 py-1 text-md font-semibold ${
                    patient.exists ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {patient.exists ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => handleStartCon(patient.patient_id)}
                  className="text-white bg-blue-500 inline-block rounded-full px-4 py-2 text-sm font-normal mt-2"
                >
                  Start Session
                </button>
              </div>
            </div>
            {/* Commented-out audio playback section preserved */}
            {/* <div className="px-6 pb-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">Voice recording</span>
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors duration-200"
                  aria-label="Play audio"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div> */}
          </div>
        );
      })}
    </div>
  );
};

export default ViewPatientList;