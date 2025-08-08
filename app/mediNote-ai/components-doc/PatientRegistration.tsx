import React, { useState } from 'react'
import { APIService } from '../service/api';
import { Patient } from '../types';

// types.ts (keep your existing types)
export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  medical_record_number: string;
}
export interface SearchParams {
  query: string;
}

const formFields =  [
    {
      id: 'name',
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'John Doe'
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'john@example.com'
    },
    {
      id: 'phone',
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: '+1234567890'
    },
    {
      id: 'date_of_birth',
      name: 'date_of_birth',
      label: 'Date of Birth',
      type: 'date',
      required: true
    },
    {
      id: 'medical_record_number',
      name: 'medical_record_number',
      label: 'Medical Record Number',
      type: 'text',
      required: true,
      placeholder: 'MRN-12345'
    }
]

export default function PatientRegistration({
  setIsPatient,
  setRegisterData
}: {
  setIsPatient: (value: boolean) => void
  setRegisterData: (data: Patient | null) => void;
}) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    medical_record_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert the date input to full ISO string
      const formattedDate = formData.date_of_birth 
        ? new Date(formData.date_of_birth).toISOString()
        : "";

      const dataToSend = {
        ...formData,
        date_of_birth: formattedDate
      };

      console.log('Submitting:', dataToSend); // Debug log

      const response = await APIService.registerPatient(dataToSend);
      
      if (!response) {
        throw new Error("No response received from server");
      }

      // Ensure the response matches the Patient type
      if (!response.id || !response.name) {
        throw new Error("Invalid patient data received");
      }

      setIsPatient(true);
      setRegisterData(response);
      
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Information</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-2 gap-4'>
          {formFields.map((field) => (
            <div key={field.id} className="mb-4">
              <label htmlFor={field.id} className="block text-gray-700 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.id}
                name={field.name}
                value={formData[field.name as keyof PatientFormData] as string}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={field.required}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
