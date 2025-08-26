"use client"
import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Edit,
  Calendar,
  User,
  Stethoscope,
  FileText,
} from "lucide-react";
import {  TranscriptionSummary } from "../types"


interface Chip {
  label: string;
  value: string;
}

interface Insights {
  title: string;
  by: string;
  bullets: string[];
}

interface Followup {
  title: string;
  note: string;
  date: string | null;
}

interface UI {
  chips: Chip[];
  insights: {
    doctor: Insights;
    patient: Insights;
  };
  followup: Followup;
}

export interface Summary {
  summary_id: number;
  title: string;
  status: string;
  content: string;
  created_at: string;
  approved_at: string | null;
  file_path: string;
  ui: UI;
}

 interface SummaryData {
  success: boolean;
  session_id: number;
  summary_id: number;
  status: string;
  title: string;
  content: string;
  created_at: string;
  approved_at: string | null;
  file_path: string;
  summary: Summary;
}

interface SummaryGeneratorProps {
  handleSaveAsDraft: () => void;
  handleApproveSummary: () => void;
  summaryData: Summary;
    // sessionId: number
    // patientId: number
    // transcriptionEnd: TranscriptionSummary
}

// Sample JSON data (would typically come from an API)
export const sampleData: SummaryData = {
  success: true,
  session_id: 53,
  summary_id: 8,
  status: "draft",
  title: "Visit Summary",
  content: "**Next Steps:** ct, follow-up, lab\n\n## Summary\nThe combined summary reflects a clinical discussion where the doctor reviewed the patient's symptoms discussed occurring recently. Relevant history and medications were reviewed. ct, follow-up, lab.\n\n### Doctor Call Insights\n- —\n\n### Patient Call Insights\n- 成\n\n\n### Follow-up Appointment\n\nTo be scheduled after results.",
  created_at: "2025-08-21T14:22:30",
  approved_at: null,
  file_path: "data/summaries/session_53_summary.txt",
  summary: {
    summary_id: 8,
    title: "Visit Summary",
    status: "draft",
    content: "**Next Steps:** ct, follow-up, lab\n\n## Summary\nThe combined summary reflects a clinical discussion where the doctor reviewed the patient's symptoms discussed occurring recently. Relevant history and medications were reviewed. ct, follow-up, lab.\n\n### Doctor Call Insights\n- —\n\n### Patient Call Insights\n- 成\n\n\n### Follow-up Appointment\n\nTo be scheduled after results.",
    created_at: "2025-08-21T14:22:30",
    approved_at: null,
    file_path: "data/summaries/session_53_summary.txt",
    ui: {
      chips: [
        {
          label: "Patient",
          value: "Patient #1"
        },
        {
          label: "Symptoms",
          value: ""
        },
        {
          label: "Duration",
          value: ""
        },
        {
          label: "Family History",
          value: ""
        },
        {
          label: "Next Steps",
          value: "** ct, follow-up, lab"
        }
      ],
      insights: {
        doctor: {
          title: "Doctor Call Insights",
          by: "Dr. 0",
          bullets: [
            "**Next Steps:** ct, follow-up, lab  ## Summary The combined summary reflects a clinical discussion where the doctor reviewed the patient's symptoms discussed occurring recently.",
            "Relevant history and medications were reviewed.",
            "### Doctor Call Insights - —  ### Patient Call Insights - 成   ### Follow-up Appointment  To be scheduled after results."
          ]
        },
        patient: {
          title: "Patient Call Insights",
          by: "Patient #1",
          bullets: []
        }
      },
      followup: {
        title: "Follow-up Appointment",
        note: "** ct, follow-up, lab",
        date: null
      }
    }
  }
};

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({
  //  sessionId, patientId, transcriptionEnd,
  handleSaveAsDraft,
  handleApproveSummary,
  summaryData
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(184);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = (): void => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = Math.floor((clickX / width) * duration);
    setCurrentTime(newTime);
  };

  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Extract data from JSON
  const patientName = summaryData.ui.chips[0].value;
  const symptoms = summaryData.ui.chips[1].value;
  const durationText = summaryData.ui.chips[2].value;
  const familyHistory = summaryData.ui.chips[3].value;
  const nextSteps = summaryData.ui.chips[4].value.replace("** ", "");
  
  const doctorName = summaryData.ui.insights.doctor.by;
  const doctorInsights = summaryData.ui.insights.doctor.bullets;
  
  const patientInsights = summaryData.ui.insights.patient.bullets;
  
  const followupNote = summaryData.ui.followup.note.replace("** ", "");
  const followupDate = summaryData.ui.followup.date;
  
  const createdDate = new Date(summaryData.created_at).toLocaleDateString();
  const createdTime = new Date(summaryData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Patient-{patientName.replace("#", "")}.mp3
            </h1>
          </div>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <Edit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
        </div>

        {/* Audio Player */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              <div
                className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mt-6 space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Patient:</span>{" "}
            <span className="text-gray-600">{patientName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Symptoms:</span>{" "}
            <span className="text-gray-600">
              {symptoms || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>{" "}
            <span className="text-gray-600">{durationText || "Not specified"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Family History:</span>{" "}
            <span className="text-gray-600">
              {familyHistory || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Next Steps:</span>{" "}
            <span className="text-gray-600">{nextSteps}</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {summaryData.content.split("## Summary")[1]?.split("### Doctor Call Insights")[0] || 
           "Summary content not available."}
        </p>
      </div>

      {/* Insights Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Doctor Call Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  Doctor Call Insights
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{doctorName}</p>
              <ul className="text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
                {doctorInsights?.length > 0 ? (
                  doctorInsights?.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))
                ) : (
                  <li>No doctor insights available</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Patient Call Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  Patient Call Insights
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{patientName}</p>
              <ul className="text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
                {patientInsights?.length > 0 ? (
                  patientInsights?.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))
                ) : (
                  <li>No patient insights available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Appointment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">
              Follow-up Appointment
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> {followupNote}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span>{" "}
              {followupDate || "To be scheduled after results"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={handleSaveAsDraft}
        >
          Save Draft
        </button>
        <button 
          onClick={handleApproveSummary}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Submit</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-8">
        {createdDate} - {createdTime}
      </div>
    </div>
  );
};

// Demo component to show the implementation
const SummaryGeneratorDemo: React.FC = () => {
  const handleSaveAsDraft = (): void => {
    alert("Save as draft clicked!");
  };

  const handleApproveSummary = (): void => {
    alert("Approve summary clicked!");
  };

  return (
    <div className=" bg-gray-100 min-h-screen">
      <div className="pt-4">

      <SummaryGenerator
          handleSaveAsDraft={handleSaveAsDraft}
          handleApproveSummary={handleApproveSummary}
          summaryData={sampleData.summary} 
           />
      </div>
    </div>
  );
};

export default SummaryGeneratorDemo;