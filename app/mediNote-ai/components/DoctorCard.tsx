import React from 'react';
import { doctor } from '../types';


interface DoctorCardProps {
  doctor: doctor;
  onUpdate: () => void;
  onEnrollVoice: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onUpdate, onEnrollVoice }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Doctor Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Dr. {doctor.first_name} {doctor.last_name}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span className="truncate">{doctor.email}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span>ID: {doctor.id}</span>
            </div>
          </div>
        </div>
        
        {/* Voice Enrollment Status */}
        {/* <div className="ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            doctor.voice_enrolled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <svg className={`w-3 h-3 mr-1 ${
              doctor.voice_enrolled ? 'text-green-500' : 'text-red-500'
            }`} fill="currentColor" viewBox="0 0 20 20">
              {doctor.voice_enrolled ? (
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.076-1.273-4.293a1 1 0 010-1.414zm-2.829 2.829a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.984 5.984 0 01-.757 2.828 1 1 0 11-1.415-1.414A3.984 3.984 0 0013 12a3.983 3.983 0 00-.172-1.172 1 1 0 010-1.415z" clipRule="evenodd" />
              )}
            </svg>
            {doctor.voice_enrolled ? 'Voice Enrolled' : 'Not Enrolled'}
          </span>
        </div> */}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onUpdate}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Update
        </button>
        
        <button
          onClick={onEnrollVoice}
          className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center ${
            doctor.voice_enrolled
              ? 'bg-green-100 hover:bg-green-200 text-green-800'
              : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          {doctor.voice_enrolled ? 'Re-enroll' : 'Enroll Voice'}
        </button>
      </div>

    </div>
  );
};

export default DoctorCard;