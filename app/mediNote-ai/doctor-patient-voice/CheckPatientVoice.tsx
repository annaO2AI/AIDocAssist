import React, { useCallback, useMemo, useState } from "react";
import { APIService } from "../service/api";
import DoctorSearch from "./Component-search-Card/DoctorSearch";
import PatientSearch from "./Component-search-Card/PatientSearch";
import PatientHistory from "./PatientHistory";
import WelcomeMessage from "./WelcomeMessage";
import { SearchDoctorsResponse, doctor } from "../types";

interface PatientCardProps {
  patient_id: number;
  name: string;
  voice_file: string;
  exists: boolean;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ssn_last4: string;
  address: string;
}

interface ApiResponse {
  results: Patient[];
}

interface CheckPatientVoiceProps {
  handleStartCon: (patientId: number, doctorId: number, patientName: string, doctorName: string) => void;
}

export default function CheckPatientVoice({
  handleStartCon,
}: CheckPatientVoiceProps) {
  /* ---------- STATE ---------- */
  const [users, setUsers] = useState<PatientCardProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPatientList, setShowPatientList] = useState(true);
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // New state for modal
  // Doctor-related state
  const [doctorSearch, setDoctorSearch] = useState<string>("");
  const [doctorResults, setDoctorResults] = useState<doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<doctor | null>(null);
  const [doctorSearching, setDoctorSearching] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  /* ---------- PATIENT SEARCH LOGIC ---------- */
  const fetchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a search query");
      setUsers([]);
      setSelectedPatientIds([]);
      setShowHistoryModal(false); // Close modal on new search
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: ApiResponse = await APIService.SearchPatient(query);

      if (!data?.results?.length) {
        setUsers([]);
        setSelectedPatientIds([]);
        setShowHistoryModal(false);
      } else {
        const patientCards: PatientCardProps[] = data.results.map((p) => ({
          patient_id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          voice_file: "",
          exists: true,
        }));
        setUsers(patientCards);
      }
      setShowPatientList(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to fetch users: ${err.message}`
          : "Failed to fetch users"
      );
      setUsers([]);
      setSelectedPatientIds([]);
      setShowHistoryModal(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle patient selection
  const handlePatientSelect = (patientId: number) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId) // Deselect
        : [...prev, patientId] // Select
    );
    setShowHistoryModal(true); // Show modal when a patient is selected
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handlePatientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchUsers(searchQuery);
    }
  };

  /* ---------- DOCTOR SEARCH LOGIC ---------- */
  const searchDoctors = useCallback(async (query: string) => {
    if (!query.trim()) {
      setDoctorError("Please enter doctor name or ID");
      setDoctorResults([]);
      setSelectedDoctor(null);
      return;
    }
    try {
      setDoctorSearching(true);
      setDoctorError(null);
      const data: SearchDoctorsResponse = await APIService.SearchDoctor(query);
      setDoctorResults(data?.results || []);
    } catch (err) {
      setDoctorError(
        err instanceof Error
          ? `Failed to search doctors: ${err.message}`
          : "Failed to search doctors"
      );
      setDoctorResults([]);
    } finally {
      setDoctorSearching(false);
    }
  }, []);

  const handleDoctorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchDoctors(doctorSearch);
    }
  };

  /* ---------- SESSION START ---------- */
  const handleStartSession = (patientId: number) => {
    if (!selectedDoctor) {
      setDoctorError("Please select a doctor before starting the session");
      return;
    }
    const selectedPatient = users.find((user) => user.patient_id === patientId);
    setShowPatientList(false);
    handleStartCon(
      patientId,
      selectedDoctor.id,
      selectedPatient?.name || "",
      `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
    );
  };

  const handleStartConversation = () => {
    if (!selectedDoctor) {
      setDoctorError("Please select a doctor before starting the session");
    }
    if (selectedPatientIds.length === 0) {
      setError("Please select at least one patient");
    }
  };

  /* ---------- MODAL CLOSE HANDLER ---------- */
  const handleCloseModal = () => {
    setShowHistoryModal(false);
    setSelectedPatientIds([]); // Optional: Clear selections when closing modal
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="flex Patient-voice mx-auto w-[80%] mt-6 transcription-welcommassege-main rounded-[1vw] relative">
      {error && selectedPatientIds.length === 0 && (
        <div className="flex gap-2 absolute left-[220px] top-[30px] z-30 w-[500px]">
          <div className="patientError">
            <svg width="129" height="39" viewBox="0 0 129 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.444784 0.503058C0.170331 0.533553 -0.0274368 0.780763 0.00305816 1.05522L0.500002 5.52769C0.530497 5.80215 0.777707 5.99991 1.05216 5.96942C1.32661 5.93892 1.52438 5.69171 1.49389 5.41726L1.05216 1.44173L5.02769 0.999998C5.30215 0.969503 5.49991 0.722293 5.46942 0.44784C5.43892 0.173387 5.19171 -0.0243809 4.91726 0.00611408L0.444784 0.503058ZM128.5 21.5L128.17 21.1243C109.818 37.2441 87.995 40.1106 65.7379 34.9504C43.4633 29.7862 20.7809 16.5844 0.812347 0.609565L0.5 1L0.187653 1.39043C20.2191 17.4156 43.0367 30.7138 65.5121 35.9246C88.005 41.1394 110.182 38.2559 128.83 21.8757L128.5 21.5Z" fill="white"/>
            </svg>
          </div>
          <div className="text-sm text-red-600 bg-[#FFD9E8] p-3 text-center rounded-md">
            Please choose a patient to continue with the conversation.
          </div>
        </div>
      )}
      <div className="flex gap-3 items-start justify-between min-h-full max-h-full h-full">
        <button
          className="flex gap-2 text-white items-center absolute left-8 top-8 z-20"
          onClick={() => {
            const customQuery = "a";
            setSearchQuery(customQuery);
            fetchUsers(customQuery);
            setShowPatientSearch(true);
          }}
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.8889 13.7143L18.9175 13.7147C19.5179 13.7303 20 14.2358 20 14.8572C20 15.4785 19.5179 15.984 18.9175 15.9996L18.8889 16H1.1111C0.497451 16 2.74887e-07 15.4883 0 14.8572C0 14.226 0.497451 13.7143 1.1111 13.7143H18.8889ZM18.8889 6.85715L18.9175 6.85752C19.5179 6.87316 20 7.37868 20 8C20 8.62132 19.5179 9.12684 18.9175 9.14248L18.8889 9.14285H1.1111C0.497451 9.14285 1.37443e-07 8.63118 0 8C0 7.36882 0.497451 6.85715 1.1111 6.85715H18.8889ZM18.8889 0L18.9175 0.000368304C19.5179 0.0160088 20 0.521523 20 1.14285C20 1.76417 19.5179 2.26969 18.9175 2.28533L18.8889 2.2857H1.1111C0.497451 2.2857 0 1.77403 0 1.14285C0 0.511664 0.497451 0 1.1111 0H18.8889Z" fill="white" />
          </svg>
          Search Patient
        </button>
        {showPatientSearch && (
          <div className="relative w-full min-h-full">
            <button
              className="absolute top-6 right-3 px-3 py-1 text-white rounded-md z-20"
              onClick={() => setShowPatientSearch(false)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z" fill="white"/>
              </svg>
            </button>
            <PatientSearch
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSubmit={handlePatientSubmit}
              onEnterKey={handlePatientKeyDown}
              loading={loading}
              error={error}
              patients={users}
              showPatientList={showPatientList}
              handleStartCon={handleStartSession}
              selectedPatientIds={selectedPatientIds}
              onPatientSelect={handlePatientSelect}
            />
          </div>
        )}
      </div>
      <WelcomeMessage username={"Doctor"} onStartConversation={handleStartConversation} />
      {doctorError && (
        <div className="flex gap-2 absolute right-[220px] top-[30px] z-30 w-[340px]">
          <div className="text-sm text-red-600 bg-[#FFD9E8] p-3 text-center rounded-md">
            {doctorError}
          </div>
          <div className="doctorError-ab">
            <svg width="132" height="40" viewBox="0 0 132 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M131.058 1.50333C131.332 1.53512 131.528 1.78327 131.497 2.05757L130.979 6.52764C130.947 6.80195 130.699 6.99854 130.424 6.96674C130.150 6.93495 129.953 6.6868 129.985 6.4125L130.446 2.4391L126.472 1.97852C126.198 1.94672 126.001 1.69858 126.033 1.42427C126.065 1.14996 126.313 0.953372 126.588 0.985169L131.058 1.50333ZM1 22.6186L1.32815 22.2413C19.969 38.4564 42.1374 41.3401 64.7455 36.1494C87.3705 30.9547 110.409 17.6756 130.69 1.60809L131 2L131.31 2.39191C110.966 18.5095 87.7935 31.8836 64.9693 37.124C42.1282 42.3683 19.6091 39.4687 0.671846 22.9958L1 22.6186Z" fill="white"/>
            </svg>
          </div>
        </div>
      )}
      <div className="relative flex gap-3">
        {selectedDoctor ? (
          <div
            className="flex gap-2 text-white items-center absolute top-6 right-6 w-[160px] z-10"
            onClick={() => {
              const customDoctorQuery = "a";
              setDoctorSearch(customDoctorQuery);
              searchDoctors(customDoctorQuery);
              setShowDoctorSearch(true);
            }}
          >
            <span className="avatar flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-semibold">{selectedDoctor.first_name.charAt(0).toUpperCase()}</span>
            <span className="font-semibold text-white flex flex-col leading-[1]">
              <span className="text-white text-[16px]">{selectedDoctor.first_name} {selectedDoctor.last_name}</span>
              <span className="text-white text-[14px] font-normal">Doctor</span>
            </span>
            <span>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.86603 7.5C5.48112 8.16667 4.51887 8.16667 4.13397 7.5L0.669873 1.5C0.284972 0.833333 0.766098 5.89981e-08 1.5359 1.26296e-07L8.4641 7.31979e-07C9.2339 7.99277e-07 9.71503 0.833334 9.33013 1.5L5.86603 7.5Z" fill="white"/>
              </svg>
            </span>
          </div>
        ) : (
          <button
            className="flex gap-2 text-white items-center absolute top-6 right-6 w-[150px] z-40"
            onClick={() => {
              const customDoctorQuery = "a";
              setDoctorSearch(customDoctorQuery);
              searchDoctors(customDoctorQuery);
              setShowDoctorSearch(true);
            }}
          >
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8889 13.7143L18.9175 13.7147C19.5179 13.7303 20 14.2358 20 14.8572C20 15.4785 19.5179 15.984 18.9175 15.9996L18.8889 16H1.1111C0.497451 16 2.74887e-07 15.4883 0 14.8572C0 14.226 0.497451 13.7143 1.1111 13.7143H18.8889ZM18.8889 6.85715L18.9175 6.85752C19.5179 6.87316 20 7.37868 20 8C20 8.62132 19.5179 9.12684 18.9175 9.14248L18.8889 9.14285H1.1111C0.497451 9.14285 1.37443e-07 8.63118 0 8C0 7.36882 0.497451 6.85715 1.1111 6.85715H18.8889ZM18.8889 0L18.9175 0.000368304C19.5179 0.0160088 20 0.521523 20 1.14285C20 1.76417 19.5179 2.26969 18.9175 2.28533L18.8889 2.2857H1.1111C0.497451 2.2857 0 1.77403 0 1.14285C0 0.511664 0.497451 0 1.1111 0H18.8889Z" fill="white" />
            </svg>
            Search Doctor
          </button>
        )}
        {showDoctorSearch && (
          <div className="relative w-full SearchDoctorToggle pt-12 z-30">
            <button
              className="absolute top-6 left-4 px-3 py-1 text-white rounded-md"
              onClick={() => setShowDoctorSearch(false)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z" fill="white"/>
              </svg>
            </button>
            <DoctorSearch
              doctorSearch={doctorSearch}
              onDoctorSearchChange={setDoctorSearch}
              onSearchDoctors={() => searchDoctors(doctorSearch)}
              onEnterKey={handleDoctorKeyDown}
              doctorSearching={doctorSearching}
              doctorError={null}
              doctorResults={doctorResults}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={setSelectedDoctor}
            />
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-col gap-3">
          <div className="full">
            {selectedPatientIds.length > 0 && showHistoryModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto relative">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={handleCloseModal}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <PatientHistory patientIds={selectedPatientIds} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="rightlinerGrading">
        <svg width="461" height="430" viewBox="0 0 461 430" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M261.412 0C341.45 8.67863e-05 413.082 35.9951 461.001 92.6807V429.783C460.94 429.856 460.878 429.928 460.816 430H289.244C370.46 416.708 432.435 346.208 432.435 261.232C432.435 166.779 355.865 90.2101 261.412 90.21C166.959 90.21 90.3887 166.779 90.3887 261.232C90.3887 346.208 152.364 416.707 233.579 430H62.0068C23.4388 384.476 0.179688 325.571 0.179688 261.232C0.179741 116.958 117.137 0 261.412 0Z" fill="#C2F5F9" fillOpacity="0.2" />
        </svg>
      </span>
      <span className="bottomlinerGrading">
        <svg width="289" height="199" viewBox="0 0 289 199" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M74.4604 14.9961C29.4945 21.2278 -3.5762 38.2063 -12.2914 45.6118L-26.7382 51.5987L-18.129 238.328L15.9938 288.05L59.727 287.301L185.831 257.872C186.478 228.034 237.253 176.817 262.56 154.938C307.047 107.868 284.151 58.3168 267.142 39.4252C236.04 -2.0024 184.942 -2.74081 158.943 2.76831C155.608 3.47505 152.272 4.08963 148.876 4.38837C134.405 5.6613 97.5463 9.50809 74.4604 14.9961Z" fill="url(#paint0_linear_3427_90583)" fillOpacity="0.4" />
          <defs>
            <linearGradient id="paint0_linear_3427_90583" x1="307.848" y1="2.45841" x2="-6.38578" y2="289.124" gradientUnits="userSpaceOnUse">
              <stop stopColor="#45CEF1" />
              <stop offset="1" stopColor="#219DF1" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </div>
  );
}