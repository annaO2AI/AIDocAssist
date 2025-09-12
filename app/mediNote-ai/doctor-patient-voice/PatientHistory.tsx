import React, { useEffect, useState } from "react";
import { APIService } from "../service/api";

interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
}

interface VisitSummary {
  session_id: number;
  title: string;
  created_at: string;
}

interface PatientHistoryResponse {
  success: boolean;
  patient: PatientData;
  history: string;
  previous_visit_summaries: VisitSummary[];
  last_updated: string | null;
}

interface ParsedSession {
  date: string;
  session: string;
  sections: { title: string; content: string[] }[];
}

interface PatientHistoryProps {
  patientIds: number[];
}

export default function PatientHistory({ patientIds }: PatientHistoryProps) {
  const normalizeHeaderText = (headerText: string): string => {
    // Normalize headers according to requirements
    if (headerText.includes("Patient Chief Concerns")) {
      return "Patient Concerns and Symptoms";
    }
    if (headerText.includes("Possible Causes / Differential")) {
      return "Possible Causes";
    }
    if (headerText.includes("Doctor's Assessment")) {
      return "Doctor's Assessment and Plan";
    }
    return headerText;
  };

  const parseHistoryField = (rawHistory: string): ParsedSession[] => {
    // If no history or empty string, return empty array
    if (!rawHistory || rawHistory.trim() === "") {
      return [];
    }
    
    const parts = rawHistory.split("---").filter(Boolean);

    return parts.map((block) => {
      const dateMatch = block.match(/Date:\s*(.+)/);
      const sessionMatch = block.match(/Session\s*(\d+)\s*summary:/);
      
      // Extract the summary content
      const summaryStart = block.indexOf("summary:");
      let summaryContent = block.slice(summaryStart + 8).trim();
      
      // Split into sections based on markdown headers
      const sectionRegex = /(^#{1,2} .+)$/gm;
      const sectionMatches = Array.from(summaryContent.matchAll(sectionRegex));
      
      const sections: { title: string; content: string[] }[] = [];
      
      // Process each section
      for (let i = 0; i < sectionMatches.length; i++) {
        const header = sectionMatches[i][0];
        const headerText = normalizeHeaderText(header.replace(/^#+ /, "").trim());
        
        // Find the content between this header and the next one
        const contentStart = sectionMatches[i].index + header.length;
        const contentEnd = i < sectionMatches.length - 1 
          ? sectionMatches[i + 1].index 
          : summaryContent.length;
        
        let content = summaryContent.slice(contentStart, contentEnd).trim();
        
        // Process bullet points and other content
        const contentLines = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Remove markdown formatting for bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '$1');
            // Remove bullet points and numbering
            return line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
          })
          .filter(line => line.length > 0);
        
        sections.push({
          title: headerText,
          content: contentLines.length > 0 ? contentLines : ["No details provided"]
        });
      }
      
      // If no sections were found, add the entire content as one section
      if (sections.length === 0) {
        sections.push({
          title: "Encounter Summary",
          content: [summaryContent || "No summary available"]
        });
      }

      return {
        date: dateMatch ? dateMatch[1].trim() : "",
        session: sessionMatch ? sessionMatch[1].trim() : "",
        sections,
      };
    });
  };

  const [patientHistories, setPatientHistories] = useState<PatientHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPatientHistories = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyPromises = patientIds.map((id) => APIService.getPatientHistory(id));
        const results = await Promise.all(
          historyPromises.map((promise) =>
            promise.catch((err) => {
              console.error(`Failed to fetch history for patient ID`, err);
              return null; // Handle individual failures
            })
          )
        );
        const validResults = results.filter((result): result is PatientHistoryResponse => result !== null);
        setPatientHistories(validResults);
        
        // Set the first patient as selected if none is selected and we have results
        if (validResults.length > 0 && !selectedPatientId) {
          setSelectedPatientId(validResults[0].patient.id);
        }
      } catch (err) {
        setError("Failed to fetch Patient Medical History");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (patientIds.length > 0) {
      fetchPatientHistories();
    } else {
      setPatientHistories([]);
      setSelectedPatientId(null);
    }
  }, [patientIds]); // Removed selectedPatientId from dependencies to avoid infinite loop

  // Spinner component
  const Loader = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      <p className="mt-4 text-gray-600 text-lg">Loading Patient Medical History...</p>
    </div>
  );

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">{error}. Please try again later.</div>;
  if (patientHistories.length === 0) return <div className="p-4">No Patient Medical History available</div>;

  // If only one patient, show that patient. Otherwise, use the selected patient or first one
  const displayPatient = patientHistories.length === 1 
    ? patientHistories[0]
    : patientHistories.find(p => p.patient.id === selectedPatientId) || patientHistories[0];

  return (
    <div className="patient-history p-6 border rounded-lg bg-white shadow-sm mt-4 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Patient Medical History</h3>

      {/* Patient Selector - only show if multiple patients */}
      {patientHistories.length > 1 && (
        <div className="mb-6">
          <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient:
          </label>
          <select
            id="patient-select"
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(Number(e.target.value))}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {patientHistories.map(history => (
              <option key={history.patient.id} value={history.patient.id}>
                {history.patient.first_name} {history.patient.last_name} (ID: {history.patient.id})
              </option>
            ))}
          </select>
        </div>
      )}

      <div key={displayPatient.patient.id} className="mb-8">
        <div className="patient-info mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 text-lg mb-2">Patient Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-blue-600 font-medium">ID:</span> {displayPatient.patient.id}
            </div>
            <div>
              <span className="text-blue-600 font-medium">Name:</span> {displayPatient.patient.first_name} {displayPatient.patient.last_name}
            </div>
          </div>
        </div>

        <div className="history-section mb-6">
          <h4 className="font-medium text-gray-700 text-lg mb-4">Medical History</h4>
          {displayPatient.history ? (
            <div className="space-y-6">
              {parseHistoryField(displayPatient.history).map((session, sessionIndex) => (
                <div key={sessionIndex} className="p-5 border rounded-lg bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-semibold text-blue-700">Session #{session.session}</div>
                    <div className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                      {new Date(session.date).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {session.sections.map((section, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-md shadow-xs">
                        <p className="font-bold text-gray-900 mb-2 text-blue-800 border-b pb-1">{section.title}</p>
                        {section.content.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                            {section.content.map((item, i) => (
                              <li key={i} className="text-sm">{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 p-4 bg-gray-50 rounded text-gray-500">No medical history recorded</div>
          )}
        </div>

        {displayPatient.previous_visit_summaries && displayPatient.previous_visit_summaries.length > 0 && (
          <div className="previous-visits mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Previous Visit Summaries</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displayPatient.previous_visit_summaries.map((visit, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded text-sm">
                  <div className="font-medium">{visit.title}</div>
                  <div className="text-gray-500">
                    {new Date(visit.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {displayPatient.last_updated && (
          <div className="text-sm text-gray-500 mt-4 italic">
            Last updated: {new Date(displayPatient.last_updated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}