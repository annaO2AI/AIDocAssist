import React, { useState, useEffect, useCallback } from "react";
import DoctorCard from "../components/DoctorCard";
import { APIService } from "../service/api";
import { UpdateDoctorModal } from "../components/UpdateDoctorModal";
import { DoctorVoiceEnroll } from "../components/DoctorVoiceEnroll";
import Image from 'next/image';

interface ApiResponse {
  results: doctor[];
}

interface doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  voice_enrolled: boolean;
}

interface DoctorCreationTypes {
  first_name: string;
  last_name: string;
  email: string;
}

const SearchDoctor: React.FC = () => {
  const [doctors, setDoctors] = useState<doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<doctor | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Memoized fetchDoctors function
  const fetchDoctors = useCallback(async () => {
    if (!searchQuery.trim()) {
      setDoctors([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      const data: ApiResponse = await APIService.SearchDoctor(searchQuery);
      if (!data) {
        setError("Something went wrong");
        throw new Error("No response received from server");
      } else {
        setDoctors(data.results);
        setHasSearched(true);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch doctors: ${err.message}`);
      } else {
        setError("Failed to fetch doctors");
      }
      setLoading(false);
      setHasSearched(true);
    }
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Fetch doctors with search query
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await fetchDoctors();
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch doctors");
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchQuery, fetchDoctors]);

  const handleUpdate = (doctorData: doctor) => {
    if (doctorData) {
      setSelectedDoctor(doctorData);
      setIsModalOpen(true);
    }
  };

  const handleEnrollVoice = (doctor: doctor) => {
    setSelectedDoctor(doctor);
    setIsVoiceModalOpen(true);
    console.log(`Enroll voice for doctor with ID: ${doctor.id}`);
  };

  const handleSave = async (updatedData: DoctorCreationTypes) => {
    if (!selectedDoctor) return;
    try {
      const response = await APIService.updateDoctor(updatedData, selectedDoctor.id);
      if (!response) {
        // alert("Failed to update doctor");
      } else {
        await fetchDoctors();
        setSelectedDoctor(null);
        setIsModalOpen(false);
        // alert("Doctor updated successfully!");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setError(error instanceof Error ? error.message : "Update failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-12 ">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Doctor Details</h1>
        {/* Search Input */}
        <div className="relative  m-auto w-[500px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search doctors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Cards Grid */}
        {!loading && !error && hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onUpdate={() => handleUpdate(doctor)}
                  onEnrollVoice={() => handleEnrollVoice(doctor)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  No doctors found matching your search
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial empty state */}
        {!loading && !error && !hasSearched && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">
              <Image 
                  src="/File searching.gif" 
                  alt="I Search" 
                  width={240} 
                  height={240} 
                  className="imagfilter m-auto"
              />
              Enter a search query to find doctors
            </p>
          </div>
        )}

        {/* Update Doctor Modal */}
        {selectedDoctor && (
          <UpdateDoctorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            doctor={{
              first_name: selectedDoctor.first_name,
              last_name: selectedDoctor.last_name,
              email: selectedDoctor.email,
            }}
            onSave={handleSave}
          />
        )}

        {isVoiceModalOpen && (
          <DoctorVoiceEnroll
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
            id={selectedDoctor?.id || 0}
          />
        )}
      </div>
    </div>
  );
};

export default SearchDoctor;