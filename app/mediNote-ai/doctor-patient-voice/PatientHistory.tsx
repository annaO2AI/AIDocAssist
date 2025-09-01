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
  const parseHistoryField = (rawHistory: string): ParsedSession[] => {
    const parts = rawHistory.split("---").filter(Boolean);

    return parts.map((block) => {
      const dateMatch = block.match(/Date:\s*(.+)/);
      const sessionMatch = block.match(/Session\s*(\d+)\s*summary:/);
      const summaryStart = block.indexOf("summary:");
      const summaryContent = block.slice(summaryStart + 8).trim();

      // Split by headers (# or ##) without relying on dotAll
      const sectionRegex = /(^#+ .+)(?:\n(?![#]+ )|$)/gm;
      const sectionMatches = summaryContent.match(sectionRegex) || [];
      let remainingContent = summaryContent;
      const sections: { title: string; content: string[] }[] = [];

      sectionMatches.forEach((header, index) => {
        const headerText = header.replace(/^#+ /, "").trim();
        const startIdx = summaryContent.indexOf(header) + header.length;
        const nextHeaderIdx = sectionMatches[index + 1]
          ? summaryContent.indexOf(sectionMatches[index + 1])
          : summaryContent.length;
        const content = summaryContent.slice(startIdx, nextHeaderIdx).trim();

        const contentLines = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("-"))
          .map((line) => line.replace(/^-\s*/, "")) // Remove bullet prefix
          .filter((line) => line.length > 0);

        sections.push({
          title: headerText,
          content: contentLines.length > 0 ? contentLines : [content || "None specified"],
        });
        remainingContent = remainingContent.replace(header, "").replace(content, "");
      });

      // Handle any remaining content (e.g., "Summary content not available")
      if (remainingContent.trim()) {
        sections.push({
          title: "Encounter Summary",
          content: [remainingContent.trim()],
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

  useEffect(() => {
    const fetchPatientHistories = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyPromises = patientIds.map((id) => APIService.getPatientHistory(id));
        const results = await Promise.all(
          historyPromises.map((promise) =>
            promise.catch((err) => {
              console.error(`Failed to fetch history for patient ID ${promise}`, err);
              return null; // Handle individual failures
            })
          )
        );
        const validResults = results.filter((result): result is PatientHistoryResponse => result !== null);
        setPatientHistories(validResults);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch patient histories");
        setLoading(false);
        console.error(err);
      }
    };

    if (patientIds.length > 0) {
      fetchPatientHistories();
    } else {
      setPatientHistories([]);
    }
  }, [patientIds]);

  // Spinner component
  const Loader = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      <p className="mt-4 text-gray-600 text-lg">Loading patient histories...</p>
    </div>
  );

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">{error}. Please try again later.</div>;
  if (patientHistories.length === 0) return <div className="p-4">No patient histories available</div>;

  return (
    <div className="patient-history p-4 border rounded-lg bg-white shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-3">Patient Histories</h3>

      {patientHistories.map((patientData, index) => (
        <div key={patientData.patient.id} className="mb-6">
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
                {parseHistoryField(patientData.history).map((session, sessionIndex) => (
                  <div key={sessionIndex} className="p-4 border rounded bg-gray-50">
                    <div className="font-semibold">Session #{session.session}</div>
                    <div className="text-sm text-gray-500">
                      Date: {new Date(session.date).toLocaleString()}
                    </div>

                    {session.sections.map((section, idx) => (
                      <div key={idx} className="mt-3">
                        <p className="font-bold text-gray-900">{section.title}</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                          {section.content.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded">No medical history recorded</div>
            )}
          </div>

          {patientData.last_updated && (
            <div className="text-sm text-gray-500 mt-3">
              Last updated: {new Date(patientData.last_updated).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}