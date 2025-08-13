import React from 'react';

interface PatientCardProps {
    patient_id: number;
    name: string;
    voice_file: string;
    exists: boolean;
}

const ViewPatientList = ({patient,handleStartCon}:{
   patient: PatientCardProps,
  handleStartCon:(id:number) => void
}) => {
  const handlePlayAudio = () => {
    const audio = new Audio(patient.voice_file);
    audio.play().catch(error => console.error('Error playing audio:', error));
  };

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-xl text-gray-800 mb-2">{patient.name}</div>
            <p className="text-gray-600 text-sm">Patient ID: {patient.patient_id}</p>
          </div>
          <div>
            <span className={`inline-block px-3 py-1 text-xs font-semibold ${patient.exists ? 'text-green-800 ' : 'text-red-800 bg-red-100'}`}>
            {patient.exists ? 'Active' : 'Inactive'}
          </span>
          <button onClick={() => handleStartCon(patient.patient_id)} className='text-green-800 bg-green-100 inline-block rounded-full px-4 py-1 text-xs font-semibold'> Start Session</button>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-600">Voice recording</span>
          <button 
            onClick={handlePlayAudio}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors duration-200"
            aria-label="Play audio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientList;