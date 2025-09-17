import React from 'react';
import { patient } from '../types';

interface UserCardProps {
  user: patient;
  onUpdate: (userId: number) => void;
  onEnrollVoice: (userId: patient) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onUpdate, onEnrollVoice }) => {
  const handleUpdate = () => {
    onUpdate(user.id);
  };

  const handleEnrollVoice = () => {
    onEnrollVoice(user);
  };

  const avatarColors = [
    'bg-indigo-600',
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-red-600',
    'bg-teal-600',
  ];
  const avatarBgColor = avatarColors[user.id % avatarColors.length];

  return (
    <div className="border border-gray-200 rounded-lg p-12 shadow-sm hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${avatarBgColor} text-white text-lg font-normal`}>
            {(user.first_name?.charAt(0)?.toUpperCase() || '')}{(user.last_name?.charAt(0)?.toUpperCase() || '')}
          </div>
          <h3 className="text-lg font-semibold">{`${user.first_name} ${user.last_name}`}</h3>
        </div>
       
      </div>
      
      <div className="space-y-2 text-sm mb-3">
        <p><span className="font-medium">Email:</span> {user.email}</p>
        <p><span className="font-medium">Phone:</span> {user.phone}</p>
        <p><span className="font-medium">SSN Last 4:</span> {user.ssn_last4}</p>
        <p><span className="font-medium">Address:</span> {user.address}</p>
        <p><span className="font-medium">Patient ID:</span> {user.id}</p>
      </div>

       <div className="flex space-x-2">
          <button 
            onClick={handleUpdate}
           className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Update
          </button>
            <button
          onClick={handleEnrollVoice}
          className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center ${
            user.voice_enrolled
              ? 'bg-green-100 hover:bg-green-200 text-green-800'
              : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          {user.voice_enrolled ? 'Re-enroll' : 'Enroll Voice'}
        </button>
        </div>
    </div>
  );
};

export default UserCard;