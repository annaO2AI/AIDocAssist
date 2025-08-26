import React, { useState, useEffect } from 'react';
import { APIService } from '../service/api';

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

interface PatientHistoryProps {
  patientId: number;
}

interface ParsedSession {
  date: string;
  session: string;
  summary: string;
  doctorInsights: string[];
  patientInsights: string[];
}

export default function PatientHistory({ patientId }: PatientHistoryProps) {
  const parseHistoryField = (rawHistory: string): ParsedSession[] => {
    const parts = rawHistory.split('---').filter(Boolean);

    return parts.map((block) => {
      const dateMatch = block.match(/Date:\s*(.+)/);
      const sessionMatch = block.match(/Session\s*(\d+)\s*summary:/);
      const summaryStart = block.indexOf('summary:');
      const summaryContent = block.slice(summaryStart + 8).trim();

      const doctorSplit = summaryContent.split('### Doctor Call Insights');
      const summary = doctorSplit[0].trim();

      let doctorInsights: string[] = [];
      let patientInsights: string[] = [];

      if (doctorSplit[1]) {
        const patientSplit = doctorSplit[1].split('### Patient Call Insights');
        doctorInsights = extractBullets(patientSplit[0]);

        if (patientSplit[1]) {
          const followUpSplit = patientSplit[1].split('### Follow-up Appointment');
          patientInsights = extractBullets(followUpSplit[0]);
        }
      }

      return {
        date: dateMatch ? dateMatch[1].trim() : '',
        session: sessionMatch ? sessionMatch[1].trim() : '',
        summary,
        doctorInsights,
        patientInsights,
      };
    });
  };

  const extractBullets = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.replace(/^-\s*/, ''));
  };

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
        {patientData.history ? (
          <div className="mt-2 space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {parseHistoryField(patientData.history).map((session, index) => (
              <div key={index} className="p-4 border rounded bg-gray-50">
                <div className="font-semibold">Session #{session.session}</div>
                <div className="text-sm text-gray-500">
                  Date: {new Date(session.date).toLocaleString()}
                </div>

                <div className="mt-2">
                  <p className="font-medium">Summary:</p>
                  <pre className="whitespace-pre-wrap bg-white p-2 border rounded mt-1">
                    {session.summary}
                  </pre>
                </div>

                {session.doctorInsights.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium">Doctor Call Insights:</p>
                    <ul className="list-disc list-inside text-sm">
                      {session.doctorInsights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {session.patientInsights.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium">Patient Call Insights:</p>
                    <ul className="list-disc list-inside text-sm">
                      {session.patientInsights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 p-3 bg-gray-50 rounded">No medical history recorded</div>
        )}
      </div>

      <div className="visits-section">
        <h4 className="font-medium text-gray-700">Previous Visits</h4>
        {patientData.previous_visit_summaries && patientData.previous_visit_summaries.length > 0 ? (
          <div className="mt-2 max-h-60 overflow-y-auto">
            <ul className="space-y-2 pr-2">
              {patientData.previous_visit_summaries.map((visit, index) => (
                <li key={index} className="p-3 border rounded bg-gray-50">
                  <div className="font-medium">Session #{visit.session_id}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Date: {new Date(visit.created_at).toLocaleDateString()} at {new Date(visit.created_at).toLocaleTimeString()}
                  </div>
                  <div className="text-sm mt-1">{visit.title}</div>
                </li>
              ))}
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