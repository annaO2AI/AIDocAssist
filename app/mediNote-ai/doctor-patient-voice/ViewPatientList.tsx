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
  selectedPatientIds: number[]; // Added prop
  onPatientSelect: (patientId: number) => void; // Added prop
}

const ViewPatientList = ({
  patients,
  handleStartCon,
  selectedPatientIds,
  onPatientSelect,
}: ViewPatientListProps) => {
  return (
    <div className="patient-list space-y-4">
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
            className="rounded-lg shadow-sm bg-white cursor-pointer handleSelectPatent"
            onClick={() => handleStartCon(patient.patient_id)}
          >
            <div className="px-4 py-2">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    {/* Checkbox added here */}
                    <input
                      type="checkbox"
                      checked={selectedPatientIds.includes(patient.patient_id)}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent card click from triggering
                        onPatientSelect(patient.patient_id);
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      aria-label={`Select patient ${patient.name}`}
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="text-gray-800 mb-2">
                      <div className="font-bold text-lg">{patient.name}</div>
                      <div className="text-[14px] osubtitle font-normal">
                        <span className="ot-title font-bold">Patient ID: </span>
                        <span className="osubtitle">{patient.patient_id}</span>
                      </div>
                    </div>
                  </div>
                  {patient.exists ? (
                    <span className="status patent-active"></span>
                  ) : (
                    <span className="status patent-inactive"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ViewPatientList;