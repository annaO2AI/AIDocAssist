'use client';

import { useCallback, useEffect, useState, useRef } from "react";
import {
  Play, Pause, Edit, CheckCircle, SkipBack, SkipForward,
  FileText, Calendar, User, Stethoscope, Save,
} from "lucide-react";
import { APIService } from "../service/api";
import { TranscriptionSummary } from "../types";
import { Summary } from "../transcription-summary/Summary";
import Image from 'next/image';
import SummaryPharmacyGen from "../pharmacy/SummaryPharmacyGen";
import { MedicationResponse } from "../pharmacy/PharmacyGenerator";

type TextCase = {
  sessionId: number;
  patientId: number;
  transcriptionEnd: TranscriptionSummary;
  summaryData: SummaryText;
  showICDGenerator: boolean;
  setShowICDGenerator: (show: boolean) => void;
  doctorId:number

};

type SummaryText = {
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
};

export default function SummaryGeneration({
  sessionId,
  patientId,
  transcriptionEnd,
  summaryData,
  showICDGenerator,
  setShowICDGenerator,
  doctorId
}: TextCase) {
  const [apiError, setApiError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [icdSectionText, setIcdSectionText] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });
  const [summaryId, setSummaryId] = useState<SummaryText | null>(null);
  const [summaryContent, setSummaryContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pharmacyData, setPharmacyData] = useState<MedicationResponse | any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Generate fixed waveform heights (shared for gray and blue)
  const waveformHeights = useRef<number[]>([]);
  useEffect(() => {
    if (waveformHeights.current.length === 0) {
      waveformHeights.current = Array.from({ length: 25 }).map(() => Math.random() * 20 + 8);
    }
  }, []);

  // Define all Hooks first
  const handleApiError = useCallback(
    (error: unknown, context: string) => {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      setApiError(`${context}: ${message}`);
      console.error(`${context} error:`, error);
    },
    []
  );

  const showNotification = useCallback((message: string) => {
    setNotification({ message, show: true });
    setTimeout(() => setNotification({ message: "", show: false }), 3000);
  }, []);

  const loadAudio = useCallback(async () => {
    if (!sessionId) return;
    try {
      setIsLoadingAudio(true);
      const info = await APIService.getRecordingInfo(sessionId);
      const directUrl = info?.web_url || null;
      if (!directUrl) {
        throw new Error('Recording URL not available');
      }
      setAudioUrl(directUrl);
      setIsLoadingAudio(false);

      if (audioRef.current) {
        audioRef.current.src = directUrl;
        audioRef.current.load();
        audioRef.current.addEventListener('loadedmetadata', () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 125);
          }
        }, { once: true });
      }

      showNotification("Audio loaded successfully!");
    } catch (err) {
      handleApiError(err, "Failed to load audio");
      setIsLoadingAudio(false);
    }
  }, [sessionId, handleApiError, showNotification]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) {
      loadAudio();
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        handleApiError(err, "Failed to play audio");
      });
    }
  }, [isPlaying, loadAudio, handleApiError]);

  const handleSkipBackward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  }, []);

  const handleSkipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  }, [duration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / duration) * 100);
    }
  }, [duration]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current || duration === 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, percent * duration));
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent * 100);
  }, [duration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const fetchSummaryById = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await APIService.getSummaryById(sessionId);
      if (data && typeof data === "object" && "summary_id" in data) {
        setSummaryId(data);
        // Check if summary is already approved
        if (data.approved_at) {
          setIsApproved(true);
          localStorage.setItem(`summaryApproved:${sessionId}`, 'true');
        }
      } else {
        setSummaryId(null);
        handleApiError(new Error("Invalid summary data"), "Failed to fetch summary");
      }
    } catch (err) {
      handleApiError(err, "Failed to fetch summary");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, handleApiError]);

  const upsertIcdSection = useCallback((baseText: string, section: string) => {
    if (!section) return baseText;
    const normalizedSection = section.replace(/^\s*ICD Codes\s*\(/, "## ICD Codes (");
    const lines = baseText.split("\n");
    // Match any header that starts with "## ICD Codes"
    const headerIndex = lines.findIndex((l) => /^##\s+ICD Codes\b/.test(l));
    if (headerIndex === -1) {
      const needsNewline = baseText.endsWith("\n") ? "" : "\n";
      return baseText + needsNewline + normalizedSection;
    }
    let endIndex = lines.length;
    for (let i = headerIndex + 1; i < lines.length; i++) {
      if (/^##\s+/.test(lines[i])) {
        endIndex = i;
        break;
      }
    }
    const before = lines.slice(0, headerIndex).join("\n");
    const after = lines.slice(endIndex).join("\n");
    const mid = normalizedSection.replace(/\n+$/, "");
    const parts = [before, mid, after].filter((p) => p.length > 0);
    return parts.join("\n") + (after ? "" : "\n");
  }, []);

  useEffect(() => {
    loadAudio();
  }, [loadAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };
    const handleLoadedData = () => {
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [handleTimeUpdate]);

  // No revoke needed when using direct web URLs

  useEffect(() => {
    fetchSummaryById();
  }, [fetchSummaryById]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load approved status from localStorage
    const savedApprovedStatus = localStorage.getItem(`summaryApproved:${sessionId}`);
    if (savedApprovedStatus === 'true') {
      setIsApproved(true);
    }

    const initializeFromStorage = () => {
      try {
        const raw = localStorage.getItem(`icdSelection:${sessionId}`);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { system?: string; items?: Array<{ code: string; title: string }>; updatedAt?: string };
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0 && parsed.system) {
          // Normalize to markdown header used in summaries without extra blank lines
          const header = `## ICD Codes\n`;
          const unique = parsed.items.reduce((acc: Array<{ code: string; title: string }>, it) => {
            if (!acc.some((x) => x.code === it.code)) acc.push(it);
            return acc;
          }, []);
          const lines = unique.map((it) => `- ${it.code}: ${it.title} - (${parsed.system})`).join("\n");
          const section = (header + lines)
            .replace(/\n{3,}/g, "\n\n") // collapse 3+ newlines
            .replace(/^\n+/, "")        // trim leading newlines
            .replace(/\n+$/, "");       // trim trailing newlines
          setIcdSectionText(section);
        } else {
          setIcdSectionText("");
        }
      } catch {
        // noop
      }
    };

    initializeFromStorage();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { sessionId: number; sectionText: string } | undefined;
      if (!detail || Number(detail.sessionId) !== Number(sessionId)) return;
      const cleaned = (detail.sectionText || "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\n+/, "")
        .replace(/\n+$/, "");
      setIcdSectionText(cleaned);
    };

    window.addEventListener("icdSelectionUpdated", handler as EventListener);
    return () => window.removeEventListener("icdSelectionUpdated", handler as EventListener);
  }, [sessionId]);

  useEffect(() => {
    if (!summaryId?.summary?.content) {
      setSummaryContent("Summary content not available.");
      return;
    }
    setSummaryContent(summaryId.summary.content);
  }, [summaryId]);

  useEffect(() => {
    if (!isEdit) return;
    setEditedSummary((current) => {
      const base = current && current.trim().length > 0 ? current : summaryContent;
      return upsertIcdSection(base || "", icdSectionText);
    });
  }, [isEdit, icdSectionText, summaryContent, upsertIcdSection]);

  // Validate props after Hooks
  if (!sessionId || !patientId || !transcriptionEnd || !summaryData) {
    console.error("Missing required props in SummaryGeneration");
    return <div>Error: Missing required props</div>;
  }

  // Rest of the component logic remains unchanged
  const parseContentSections = (content: string) => {
    if (!content) return [];
    const sections = content.split(/(?=^#+ )/m).filter(section => section.trim());
    return sections.map(section => {
      const lines = section.trim().split('\n');
      const headerLine = lines[0];
      const contentLines = lines.slice(1);
      const headerMatch = headerLine.match(/^(#+)\s*(.+)/);
      if (!headerMatch) return null;
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();
      const content = contentLines.join('\n').trim();
      return { level, title, content };
    }).filter(Boolean);
  };

  const handleSaveEditedSummary = async () => {
    const resolvedSummaryId = summaryId?.summary_id ?? transcriptionEnd?.summary_id ?? summaryData?.summary_id;
    if (!resolvedSummaryId) {
      handleApiError(new Error("summary_id not available"), "Cannot update summary");
      return;
    }
    try {
      setIsLoading(true);
      await APIService.editSummary({
        summaryId: resolvedSummaryId,
        edited_text: editedSummary || summaryContent,
      });
      setSummaryContent(editedSummary || summaryContent);
      setIsEdit(false);
      showNotification("Summary updated successfully!");
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`visitSummaryEdit:${sessionId}`, "false");
          window.dispatchEvent(new CustomEvent("visitSummaryEditToggle", { detail: { sessionId, isEdit: false } }));
        }
      } catch {}
    } catch (err) {
      handleApiError(err, "Failed to update summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    try {
      setIsLoading(true);
      await APIService.saveSummary({
        doctor_id: 1,
        patient_id: patientId,
        session_id: sessionId,
        original_text: summaryContent,
        summary_text: editedSummary,
      });
      showNotification("Summary saved successfully!");
    } catch (err) {
      handleApiError(err, "Failed to save summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSummary = async () => {
    try {
      setIsLoading(true);
      await APIService.saveFinalSummary({ session_id: sessionId });
      setIsApproved(true);
      localStorage.setItem(`summaryApproved:${sessionId}`, 'true');
      showNotification("Summary approved successfully!");
    } catch (err) {
      handleApiError(err, "Failed to approve summary");
    } finally {
      setIsLoading(false);
    }
  };

  const processDoctorInsights = (bullets: string[] = []) => {
    const clean = (str: string) => {
      return str
        .replace(/[*#]+/g, "")
        .replace(/^-\s*/, "")
        .replace(/^\w+\s*-\s*/, "")
        .trim();
    };
    const sections: Record<string, string[]> = {
      Treatment: [],
      Instructions: [],
      General: [],
    };
    bullets.forEach((text) => {
      const cleanText = clean(text);
      if (cleanText) {
        if (/treatment|therapy|medication|administered/i.test(text)) {
          sections.Treatment.push(cleanText);
        } else if (/instruction|education|precaution/i.test(text)) {
          sections.Instructions.push(cleanText);
        } else {
          sections.General.push(cleanText);
        }
      }
    });
    return sections;
  };

  const processPatientInsights = (bullets: string[] = []) => {
    return bullets
      .map(bullet =>
        bullet
          .replace(/[*#]+/g, "")
          .replace(/^-\s*/, "")
          .replace(/^\w+\s*Summary\s*-\s*/i, "")
          .trim()
      )
      .filter(bullet => bullet.length > 0);
  };

  const renderContentSections = (content: string) => {
    const sections = parseContentSections(content || "");
    return sections.map((section, index) => {
      if (!section) return null;
      const { level, title, content: sectionContent } = section;
      const displayTitle = title === "Patient Chief Concerns & Symptoms"
        ? "Patient Concerns & Symptoms"
        : title;

      const formatContent = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map((line, lineIndex) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            const bulletText = trimmed.replace(/^[-•]\s*/, '').trim();
            return (
              <li key={lineIndex} className="text-gray-700 text-sm leading-relaxed ml-4 mb-1">
                {bulletText}
              </li>
            );
          }
          return (
            <p key={lineIndex} className="text-gray-700 text-sm leading-relaxed mb-2">
              {trimmed}
            </p>
          );
        }).filter(Boolean);
      };
      const HeaderTag = level === 1 ? 'h2' : 'h3';
      const headerClass = level === 1
        ? 'text-lg font-semibold text-gray-900 mb-3 mt-6 first:mt-0'
        : 'text-md font-medium text-gray-800 mb-2 mt-4';
      return (
        <div key={index} className="mb-4">
          <HeaderTag className={headerClass}>{displayTitle}</HeaderTag>
          <div className="pl-2">
            {sectionContent.includes('-') || sectionContent.includes('•') ? (
              <ul className="list-none space-y-1">{formatContent(sectionContent)}</ul>
            ) : (
              <div>{formatContent(sectionContent)}</div>
            )}
          </div>
        </div>
      );
    });
  };

  const patientName = summaryId?.summary?.ui?.chips?.[0]?.value ?? "Patient";
  const symptoms = summaryId?.summary?.ui?.chips?.[1]?.value ?? "Not specified";
  const durationText = summaryId?.summary?.ui?.chips?.[2]?.value ?? "Not specified";
  const familyHistory = summaryId?.summary?.ui?.chips?.[3]?.value ?? "Not specified";
  const nextSteps = summaryId?.summary?.ui?.chips?.[4]?.value?.replace(/\*\*/g, "") ?? "";
  const doctorName = summaryId?.summary?.ui?.insights?.doctor?.by ?? "Doctor";
  const doctorBullets = summaryId?.summary?.ui?.insights?.doctor?.bullets ?? [];
  const structuredInsights = processDoctorInsights(doctorBullets);
  const patientBullets = summaryId?.summary?.ui?.insights?.patient?.bullets ?? [];
  const processedPatientInsights = processPatientInsights(patientBullets);
  const followupNote = summaryId?.summary?.ui?.followup?.note?.replace(/\*\*/g, "") ?? "";
  const followupDate = summaryId?.summary?.ui?.followup?.date ?? "To be scheduled";

  const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    </div>
  );

  const handleDownloadRecording = async () => {
    try {
      setIsDownloading(true);
      const info = await APIService.getRecordingInfo(sessionId);
      const url = info?.web_url || '';
      if (!url) throw new Error('Recording URL not available');
      // Force download by fetching as blob and using an object URL
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = info?.filename || `Patient-${patientName.replace("#", "")}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showNotification("Recording downloaded successfully!");
    } catch (err) {
      handleApiError(err, "Failed to download recording");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <>
        <div className={`w-full mt-12 p-16 mx-auto bg-gray-50 min-h-screen rounded-lg summaryGenerationSection relative ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {notification.show && (
            <div className="fixed top-4 right-4 z-50">
              <div className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-md shadow-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                {notification.message}
              </div>
            </div>
          )}
          <div className="rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5 8.8421C6.18575 8.8421 7.14283 7.85471 7.14283 6.6316V2.21053C7.14283 0.987368 6.18575 0 5 0C3.81425 0 2.85714 0.987368 2.85714 2.21053V6.6316C2.85714 7.85471 3.81425 8.8421 5 8.8421ZM4.28575 2.21053C4.28575 1.80527 4.60717 1.47369 5 1.47369C5.39283 1.47369 5.71425 1.80527 5.71425 2.21053V6.6316C5.71425 7.04423 5.4 7.3684 5 7.3684C4.60717 7.3684 4.28575 7.03684 4.28575 6.6316V2.21053ZM8.78575 6.6316H10C10 9.14418 8.05717 11.2221 5.71425 11.5832V14H4.28575V11.5832C1.94286 11.2221 0 9.14418 0 6.6316H1.21428C1.21428 8.8421 3.02858 10.3895 5 10.3895C6.97142 10.3895 8.78575 8.8421 8.78575 6.6316Z" fill="#fff"/>
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 text-white">
                  Patient-{patientName.replace("#", "")}.mp3
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDownloadRecording}
                  disabled={isDownloading || isLoading || isApproved}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Enhanced horizontal audio player with layered waveform */}
            <div className="relative w-full max-w-2xl mb-6">
              <div className="relative rounded-full overflow-hidden flex items-center px-2 py-2 border border-white">
                {/* Control Buttons */}
                <div className="flex items-center space-x-2 mr-3">
                  {/* Backward 10s */}
                  {/* <button
                    className="p-2 text-white/70 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSkipBackward}
                    disabled={isLoadingAudio || isLoading || isApproved}
                    title="Rewind 10 seconds"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button> */}
                  
                  {/* Play/Pause Button */}
                  <button
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLoadingAudio ? 'animate-pulse' : ''
                    }`}
                    onClick={togglePlayPause}
                    disabled={isLoadingAudio || isLoading || isApproved}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isLoadingAudio ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    )}
                  </button>
                  
                  {/* Forward 10s */}
                  {/* <button
                    className="p-2 text-white/70 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSkipForward}
                    disabled={isLoadingAudio || isLoading || isApproved}
                    title="Fast forward 10 seconds"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button> */}
                </div>
                
                {/* Layered Waveform Visualization */}
                <div className="relative flex-1 h-6 mx-2 overflow-hidden">
                  {/* Gray background waveform - full length */}
                  <div className="absolute inset-0 flex items-center space-x-0.5">
                    {waveformHeights.current.map((height, i) => (
                      <div
                        key={`gray-${i}`}
                        className="w-0.5 bg-blue-300 rounded-full opacity-[.37]"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                  
                  {/* Blue highlight waveform - increases with progress */}
                  <div 
                    className="absolute inset-0 flex items-center space-x-0.5 overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="flex items-center space-x-0.5">
                      {waveformHeights.current.map((height, i) => (
                        <div
                          key={`blue-${i}`}
                          className={`w-0.5 bg-blue-200 rounded-full transition-all duration-300 ease-in-out ${
                            isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar with Click-to-Seek */}
                <div className="flex items-center space-x-2 mx-3" ref={progressRef}>
                  <div className="w-16 text-white text-xs font-medium text-left min-w-[3.5rem]">
                    {formatTime(currentTime)}
                  </div>
                  
                  <div 
                    className="flex-1 h-1.5 bg-white/30 rounded-full cursor-pointer relative group"
                    onClick={handleSeek}
                  >
                    <div 
                      className={`h-full bg-white/80 rounded-full transition-all duration-300 ease-linear relative overflow-hidden ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{ width: `${progress}%` }}
                    >
                      {/* Thumb indicator */}
                      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                  
                  <div className="w-10 text-white text-xs font-medium text-right min-w-[2.5rem]">
                    {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>
            {/* <Image
              src="/audio-clip-illustrations.svg"
              alt="Audio Clip Illustration"
              width={449}
              height={42}
            /> */}
          </div>
          <div className="rounded-lg shadow-sm p-6 mb-6 bg-white ">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Visit Summary</h2>
                  <div className="flex gap-4">
                <button
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={() => setShowICDGenerator(!showICDGenerator)}
                disabled={isLoading || isApproved}
              >
                ICD Code Generator
              </button>
                 <SummaryPharmacyGen 
              data={pharmacyData}
              setData={setPharmacyData}
              sessionId={sessionId}
              patientId={patientId}
              doctorId={doctorId}
              />
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="w-full pr-4">
                {isEdit ? (
                  <textarea
                    className="w-full h-96 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                    value={editedSummary || ""}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    placeholder="Edit the summary here..."
                    disabled={isApproved}
                  />
                ) : (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {summaryContent === "Summary content not available." ? (
                      <p>{summaryContent}</p>
                    ) : (
                      renderContentSections(summaryContent || "")
                    )}
                  </div>
                )}
              </div>
              <div className="w-[300px] flex flex-col items-center justify-center">
                <Image
                  src="/summary-docter-petiont.svg"
                  alt="Doctor-Patient Illustration"
                  width={250}
                  height={170}
                  className="mt-12"
                />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Doctor Call Insights</h3>
                  <p className="text-sm text-gray-600 mb-3">{doctorName}</p>
                  {Object.entries(structuredInsights).map(
                    ([section, items]) =>
                      items.length > 0 && (
                        <div key={section} className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">{section}</h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                            {items.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )
                  )}
                  {doctorBullets.length === 0 && (
                    <p className="text-sm text-gray-500">No doctor insights available.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Patient Call Insights</h3>
                  <p className="text-sm text-gray-600 mb-3">{patientName}</p>
                  {processedPatientInsights.length > 0 ? (
                    <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                      {processedPatientInsights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No patient insights available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg shadow-sm p-6 follow-upAppointment-gradiant">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Image
                  src="/follow-up-appointment.svg"
                  alt="Follow-up Illustration"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Follow-up Appointment</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> {followupNote || "No follow-up actions specified"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {followupDate}
                </p>
              </div>
            </div>
          </div>
        
          <span className="bottomlinerGrading">
                <svg width="289" height="199" viewBox="0 0 289 199" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M74.4604 14.9961C29.4945 21.2278 -3.5762 38.2063 -12.2914 45.6118L-26.7382 51.5987L-18.129 238.328L15.9938 288.05L59.727 287.301L185.831 257.872C186.478 228.034 237.253 176.817 262.56 154.938C307.047 107.868 284.151 58.3168 267.142 39.4252C236.04 -2.0024 184.942 -2.74081 158.943 2.76831C155.608 3.47505 152.272 4.08963 148.876 4.38837C134.405 5.6613 97.5463 9.50809 74.4604 14.9961Z" fill="url(#paint0_linear_3427_90583)" fillOpacity="0.4"/>
                <defs>
                <linearGradient id="paint0_linear_3427_90583" x1="307.848" y1="2.45841" x2="-6.38578" y2="289.124" gradientUnits="userSpaceOnUse">
                <stop stopColor="#45CEF1"/>
                <stop offset="1" stopColor="#219DF1"/>
                </linearGradient>
                </defs>
                </svg>
          </span>
          <span className="rightlinerGrading">
          <svg width="461" height="430" viewBox="0 0 461 430" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M261.412 0C341.45 8.67863e-05 413.082 35.9951 461.001 92.6807V429.783C460.94 429.856 460.878 429.928 460.816 430H289.244C370.46 416.708 432.435 346.208 432.435 261.232C432.435 166.779 355.865 90.2101 261.412 90.21C166.959 90.21 90.3887 166.779 90.3887 261.232C90.3887 346.208 152.364 416.707 233.579 430H62.0068C23.4388 384.476 0.179688 325.571 0.179688 261.232C0.179741 116.958 117.137 0 261.412 0Z" fill="#C2F5F9" fillOpacity="0.2"/>
          </svg>
          </span>
        </div>
        <div className="flex justify-center space-x-4 mt-8 mb-8 relative  z-[1]">
            {!isEdit && (
              <button
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleApproveSummary}
                disabled={isLoading || isApproved}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Approve Summary</span>
              </button>
            )}
            {!isEdit && !isApproved && (
              <button
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={() => {
                  setIsEdit(true);
                  setEditedSummary(summaryContent);
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.setItem(`visitSummaryEdit:${sessionId}`, "true");
                      window.dispatchEvent(new CustomEvent("visitSummaryEditToggle", { detail: { sessionId, isEdit: true } }));
                    }
                  } catch {}
                }}
                disabled={isLoading || isApproved}
              >
                <Edit className="w-4 h-4 mr-2" />
                <span>Edit Summary</span>
              </button>
            )}
            {isEdit && (
              <button
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                onClick={handleSaveEditedSummary}
                disabled={isLoading || isApproved}
              >
                <Save className="w-4 h-4 mr-2" />
                <span>Save Changes</span>
              </button>
            )}
            {isEdit && (
              <button
                className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                onClick={() => {
                  setIsEdit(false);
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.setItem(`visitSummaryEdit:${sessionId}`, "false");
                      window.dispatchEvent(new CustomEvent("visitSummaryEditToggle", { detail: { sessionId, isEdit: false } }));
                    }
                  } catch {}
                }}
                disabled={isLoading || isApproved}
              >
                <span>Cancel</span>
              </button>
            )}
            {!isEdit && !isApproved && (
              <button
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleSaveSummary}
                disabled={isLoading || isApproved}
              >
                <Save className="w-4 h-4 mr-2" />
                <span>Save for Later</span>
              </button>
            )}
        </div>
      </>
      {/* Properly connected audio element */}
        {audioUrl && (
            <audio 
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              style={{ display: 'none' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
                setProgress(0);
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => {
                const target = e.target as HTMLAudioElement;
                setDuration(target.duration || 0);
              }}
            />
          )}
  </>
  );
}