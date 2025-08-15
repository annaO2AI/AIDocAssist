import { APIService } from "../service/api";
import { useTranscriptionWebSocket } from "./useTranscriptionWebSocket";
import { useState, useEffect, useCallback } from "react";
import { StopRecoding, Speeker, AudioLineIcon  } from "../../chat-ui/components/icons"

interface TextCase {
  sessionId: number;
}

interface SummaryData {
  id?: number;
  content: string;
  status?: string;
}

export default function TranscriptionComponent({ sessionId }: TextCase) {
  // WebSocket hook
  const {
    isConnected,
    isRecording,
    transcription,
    error: wsError,
    startRecording,
    stopRecording,
    connect,
    disconnect,
  } = useTranscriptionWebSocket({
    sessionId,
    autoConnect: true,
  });

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<SummaryData>({ content: "" });
  const [apiError, setApiError] = useState("");
  const [shouldFetchSummary, setShouldFetchSummary] = useState(false);

  // Format timestamp for logs
  const formatTime = useCallback((timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString();
  }, []);

  // Get final transcription text
  const getFinalTranscription = useCallback(() => {
    return transcription
      .filter(t => t.type === 'Doctor')
      .map(t => t.text)
      .join(" ");
  }, [transcription]);

  // Handle API errors consistently
  const handleApiError = useCallback((error: unknown, context: string) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unknown error occurred";
    
    setApiError(`${context}: ${errorMessage}`);
    console.error(`${context} error:`, error);
  }, []);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    if (!shouldFetchSummary) return;

    try {
      setIsProcessing(true);
      setApiError("");
      
      const data = await APIService.getSummaryById(sessionId);
      setSummary(data);
      setShouldFetchSummary(false);
    } catch (err) {
      handleApiError(err, "Failed to fetch summary");
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, shouldFetchSummary, handleApiError]);

  // Generate summary handler
  const handleGenerateSummary = useCallback(async () => {
    try {
      setIsProcessing(true);
      setApiError("");
      
      const transcriptionText = getFinalTranscription();
      const data = await APIService.generateSummary(transcriptionText);
      setSummary(data);
    } catch (err) {
      handleApiError(err, "Failed to generate summary");
    } finally {
      setIsProcessing(false);
    }
  }, [getFinalTranscription, handleApiError]);

  // Save summary handler
  const handleSaveSummary = useCallback(async () => {
    try {
      setIsProcessing(true);
      setApiError("");
      
      const data = await APIService.saveSummary({
        doctor_id: 1, // Should be dynamic in production
        patient_id: 1, // Should be dynamic in production
        session_id: sessionId,
        original_text: getFinalTranscription(),
        summary_text: summary.content,
      });
      
      setSummary(data);
      alert("Summary saved successfully!");
    } catch (err) {
      handleApiError(err, "Failed to save summary");
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, summary.content, getFinalTranscription, handleApiError]);

  // Approve summary handler
  const handleApproveSummary = useCallback(async () => {
    if (!summary.id) return;

    try {
      setIsProcessing(true);
      setApiError("");
      
      const data = await APIService.saveFinalSummary({
        session_id: sessionId,
        final_content: summary.content,
        title: `Session ${sessionId} Summary`,
      });

      setSummary(data);
      alert("Summary approved successfully!");
    } catch (err) {
      handleApiError(err, "Failed to approve summary");
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, summary.id, summary.content, handleApiError]);

  // Update summary handler
  const handleUpdateSummary = useCallback(async () => {
    if (!summary.id) return;

    try {
      setIsProcessing(true);
      setApiError("");
      
      const data = await APIService.editSummary({
        summaryId: summary.id,
        edited_text: summary.content,
      });
      
      setSummary(data);
      alert("Summary updated successfully!");
    } catch (err) {
      handleApiError(err, "Failed to update summary");
    } finally {
      setIsProcessing(false);
    }
  }, [summary.id, summary.content, handleApiError]);

  // Trigger summary fetch when recording stops
  useEffect(() => {
    if (!isRecording && transcription.length > 0) {
      setShouldFetchSummary(true);
    }
  }, [isRecording, transcription.length]);

  // Fetch summary when needed
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="mediNote-widthfix mx-auto rounded-lg px-4">
      
      <div className="mediNote-widthfix-warpper">
        {/* Transcription Display */}
        <div className="mb-4">
          <div className="bg-white rounded-md max-h-96 overflow-y-auto">
            {transcription.length === 0 ? (
              <p className="text-gray-500 italic">
                {isConnected ? "No transcription yet. Start recording to begin." : "Connect to begin transcription."}
              </p>
            ) : (
              transcription.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 p-2 rounded ${
                    msg.type === "error" ? "bg-red-50 border-l-4 border-red-500" :
                    msg.type === "Patient" ? "bg-blue-50 border-l-4 border-blue-500" :
                    "bg-gray-50 border-l-4 border-gray-300"
                  }`}
                >
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium capitalize">{msg.type}</span>
                    <span>{formatTime(msg.ts)}</span>
                  </div>
                  <p className="text-gray-800">{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {(wsError || apiError) && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{wsError || apiError}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-between flex-nowrap controle-search-AIDocAssist h-[90px]">
          <div className="flex items-center">
            {/* <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              className={`px-6 py-4 rounded-md font-medium ${
                isRecording ? "bg-blue-200 hover:bg-blue-300" : "bg-blue-200 hover:bg-blue-300"
              } text-white ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <span className="flex items-center">
                  <Speeker />
                </span>
              ) : 
              <span>
                <span className="flex items-center bg-blue-200 hover:bg-blue-300">
                  <Speeker />
                </span>
                <AudioLineIcon />
              </span>
              }
            </button> */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
            >
              {isRecording ? (
                <span className="flex gap-3 items-center">
                <span className=" px-6 py-4 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">
                  <Speeker />
                </span>
                <AudioLineIcon />
              </span>
              ) : 
              <span className="flex gap-3 items-center">
                <span className=" px-6 py-4 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">
                  <Speeker />
                </span>
              </span>
              }
            </button>
          </div>
          <div className="flex gap-2 items-center">
            {/* <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              className={`px-4 py-2 rounded-md font-medium ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              } text-white ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <span className="flex items-center">
                  <span className="h-2 w-2 mr-2 bg-white rounded-full animate-pulse" />
                  Stop Recording
                </span>
              ) : "Start Recording"}
            </button> */}

            {/* <button
              onClick={connect}
              disabled={isConnected}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </button> */}

            {/* <button
              onClick={disconnect}
              disabled={!isConnected}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect
            </button> */}

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              className={`rounded-md font-medium h-[44px] ${
                isRecording ? "bg-white-500 hover:bg-white-600" : "px-4 py-2  bg-blue-500 hover:bg-blue-600"
              } text-white ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <span className="flex items-center">
                    <StopRecoding />
                </span>
              ) : "Start Recording"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {!isRecording && transcription.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-md border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Summary</h2>
          
          <textarea
            value={summary.content}
            onChange={(e) => setSummary({...summary, content: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md min-h-32 mb-4"
            placeholder="Summary will appear here..."
            disabled={isProcessing}
          />
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Generating..." : "Generate Summary"}
            </button>
            
            {summary.content && (
              <>
                <button
                  onClick={handleSaveSummary}
                  disabled={isProcessing || !summary.content}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Saving..." : "Save Summary"}
                </button>
                
                {summary.id && (
                  <>
                    <button
                      onClick={handleApproveSummary}
                      disabled={isProcessing || summary.status === "approved"}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Approving..." : "Approve Summary"}
                    </button>
                    
                    <button
                      onClick={handleUpdateSummary}
                      disabled={isProcessing || !summary.id}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Updating..." : "Update Summary"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          
          {summary.status && (
            <div className="mt-3 text-sm">
              Status: <span className="font-medium capitalize">{summary.status}</span>
            </div>
          )}
        </div>
      )}

      {/* WebSocket Logs */}
      {/* <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-700">WebSocket Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto">
          {transcription.map((msg, i) => (
            <div key={i} className="mb-1">
              <span className="text-gray-400">
                [{formatTime(msg.ts) || "unknown time"}]
              </span>{" "}
              <span className={
                msg.type === "error" ? "text-red-400" :
                msg.type === "Patient" ? "text-yellow-400" :
                "text-green-400"
              }>
                {msg.type.toUpperCase()}
              </span>
              : {msg.text}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}