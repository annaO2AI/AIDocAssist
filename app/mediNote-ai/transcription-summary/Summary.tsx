import React, { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Edit,
  Calendar,
  User,
  Stethoscope,
  Clock,
  FileText,
} from "lucide-react"

const SummaryGenerator = ({
  handleSaveAsDraft,
  handleApproveSummary
}: {
  handleSaveAsDraft: any
  handleApproveSummary: any
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(184) // 3:04 in seconds
  const audioRef = useRef(null)

  const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = Math.floor((clickX / width) * duration)
    setCurrentTime(newTime)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Patient-Davis.mp3
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
            <span className="text-gray-600">Mr. Davis</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Symptoms:</span>{" "}
            <span className="text-gray-600">
              Chest tightness during exertion, mild shortness of breath
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>{" "}
            <span className="text-gray-600">Past few days</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Family History:</span>{" "}
            <span className="text-gray-600">
              Father had a heart attack in his 50s
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Next Steps:</span>{" "}
            <span className="text-gray-600">ECC and blood tests scheduled</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          The combined summary for Dr. Rachel and Mr. Davis reveals a medical
          consultation where the doctor noted the patient&apos;s chest discomfort
          over the past few days and conducted a detailed inquiry into the panic
          nature. This issue resolved in establishing a comprehensive
          understanding of the patient&apos;s current health status. Mr. Davis, a
          48-year-old with a history of hypertension and Type 2 Diabetes,
          reported this as his first noticeable episode and confirmed a family
          history of heart attack, prompting Dr. Rachel to schedule an ECG and
          blood tests to investigate potential angina. The doctor plans to
          review the results and determine the next steps, while the patient&apos;s
          ongoing medications, Amlodipine for hypertension and Metformin for
          diabetes, were noted with specific dosages and start dates. This
          proactive approach aims to address the symptoms and underlying risks,
          with a follow-up appointment tentatively set for early August 2025
          pending lab outcomes.
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
              <p className="text-sm text-gray-600 mb-3">Dr. Rachel</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Noted patient&apos;s chest discomfort over the past few days.
                Inquired about pain description (sharp, dull, ache) and
                shortness of breath. Asked about prior occurrence and family
                history of heart conditions. Scheduled ECC and blood tests based
                on symptoms and family history. Planned to review results and
                proceed.
              </p>
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
              <p className="text-sm text-gray-600 mb-3">Mr. Davis</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Reported chest discomfort for the past few days, described as
                tight sensation when climbing stairs or during fast movements.
                Acknowledged having hypertension and diabetes. Experienced
                slight shortness of breath, which improves with rest. First
                noticeable occurrence of this intensity. Confirmed family
                history of heart attack (father in early 50s).
              </p>
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
              <span className="font-medium">Date:</span> To be determined after
              lab results (estimated around 01/08/2025)
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
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
        10/07/2024 - 4:30 PM
      </div>
    </div>
  )
}

export default SummaryGenerator
