import React, { useState, useEffect } from 'react';
import { APIService } from '../service/api';

interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
}

interface VisitSummary {
  date: string;
  session_number: number;
  summary: string;
}

interface PatientHistoryResponse {
  success: boolean;
  patient: PatientData;
  history: string;
  previous_visit_summaries: VisitSummary[];
  last_updated: string | null;
}

interface PatientHistoryProps {
  patientId: number;
}

export default function PatientHistory({ patientId }: PatientHistoryProps) {
  const [patientData, setPatientData] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setLoading(true);
        const data = await APIService.getPatientHistory(patientId);
        setPatientData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient history');
        setLoading(false);
        console.error(err);
      }
    };

    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  // Function to parse the summary format you provided
  const parseVisitSummary = (summary: any) => {
    if (typeof summary === 'string') {
      // Try to extract session number and date from the string format
      const sessionMatch = summary.match(/Session (\d+) summary:/);
      const dateMatch = summary.match(/Date: (.+)\n/);
      const summaryMatch = summary.match(/Summary: (.+)$/);
      
      return {
        session_number: sessionMatch ? parseInt(sessionMatch[1]) : 0,
        date: dateMatch ? dateMatch[1] : new Date().toISOString(),
        summary: summaryMatch ? summaryMatch[1] : summary
      };
    }
    
    // If it's already an object with the expected properties
    return {
      session_number: summary.session_number || 0,
      date: summary.date || new Date().toISOString(),
      summary: summary.summary || "No summary available"
    };
  };

  if (loading) return <div className="p-4">Loading patient history...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!patientData) return <div className="p-4">No patient data available</div>;

  return (
    <div className="patient-history p-4 border rounded-lg bg-white shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-3">Patient History</h3>
      
      <div className="patient-info mb-4">
        <h4 className="font-medium text-gray-700">Patient Details</h4>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-gray-500">ID:</span> {patientData.patient.id}
          </div>
          <div>
            <span className="text-gray-500">Name:</span> {patientData.patient.first_name} {patientData.patient.last_name}
          </div>
        </div>
      </div>

      <div className="history-section mb-4">
        <h4 className="font-medium text-gray-700">Medical History</h4>
        <div className="mt-2 p-3 bg-gray-50 rounded">
          {patientData.history || "No medical history recorded"}
        </div>
      </div>

      <div className="visits-section">
        <h4 className="font-medium text-gray-700">Previous Visits</h4>
        {patientData.previous_visit_summaries && patientData.previous_visit_summaries.length > 0 ? (
          <div className="mt-2 max-h-60 overflow-y-auto">
            <ul className="space-y-2 pr-2">
              {patientData.previous_visit_summaries.map((visit, index) => {
                const parsedVisit = parseVisitSummary(visit);
                return (
                  <li key={index} className="p-3 border rounded bg-gray-50">
                    <div className="font-medium">Session #{parsedVisit.session_number}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Date: {new Date(parsedVisit.date).toLocaleDateString()} at {new Date(parsedVisit.date).toLocaleTimeString()}
                    </div>
                    <div className="mt-2 p-2 bg-white rounded border">
                      {parsedVisit.summary}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-gray-50 rounded">No previous visits recorded</div>
        )}
      </div>

      {patientData.last_updated && (
        <div className="text-sm text-gray-500 mt-3">
          Last updated: {new Date(patientData.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
}