import React, { useState } from 'react';
import { patient } from '../types';


interface UserCardProps {
  user: patient;
  onUpdate: (userId: number) => void;
  onEnrollVoice: (userId: patient) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onUpdate, onEnrollVoice }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleUpdate = () => {
    setShowMenu(false);
    onUpdate(user.id);
  };

  const handleEnrollVoice = () => {
    setShowMenu(false);
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
    <div className="border border-gray-200 rounded-lg p-12 shadow-sm hover:shadow-lg transition-shadow relative bg-white">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${avatarBgColor} text-white text-lg font-normale`}>
            {(user.first_name?.charAt(0)?.toUpperCase() || '')}{(user.last_name?.charAt(0)?.toUpperCase() || '')}
          </div>
          <h3 className="text-lg font-semibold">{`${user.first_name} ${user.last_name}`}</h3>
        </div>
        <div className="relative">
          <button 
            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleUpdate}
              >
                Update
              </button>
              <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleEnrollVoice}
              >
                {user.voice_enrolled ? 'Re-enroll Voice' : 'Enroll Voice'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Email:</span> {user.email}</p>
        <p><span className="font-medium">Phone:</span> {user.phone}</p>
        {/* <p><span className="font-medium">SSN Last 4:</span> {user.ssn_last4}</p> */}
        {/* <p><span className="font-medium">Address:</span> {user.address}</p> */}
        <p><span className="font-medium">Patient ID:</span> {user.id}</p>
        <p>
          <span className="font-medium">Voice Status:</span> 
          <span className={`ml-1 px-2 py-1 text-xs rounded-full ${user.voice_enrolled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {user.voice_enrolled ? 'Enrolled' : 'Not Enrolled'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default UserCard