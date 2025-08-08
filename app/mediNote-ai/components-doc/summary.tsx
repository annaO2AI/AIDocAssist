'use client'

import { useState } from 'react'


export type SummaryType = 'quick' | 'detailed' | 'medical_notes'

export interface SummaryResponse {
  id: string
  conversation_id: string
  summary_type: string
  content: string
  generated_by: string
  created_at: string
}


interface SummarySectionProps {
  sessionId: string
  summaries: SummaryResponse[]
  detailedSummary: SummaryResponse | null
  isFetchingSummaries: boolean
  summaryType: 'quick' | 'detailed' | 'medical_notes'
  setSummaryType: (type: 'quick' | 'detailed' | 'medical_notes') => void
  fetchSummaries: (conversationId: string) => Promise<void>
  showSummaryOptions: boolean
  setShowSummaryOptions: (show: boolean) => void
}

export default function SummarySection({
  sessionId,
  summaries,
  detailedSummary,
  isFetchingSummaries,
  summaryType,
  setSummaryType,
  fetchSummaries,
  showSummaryOptions,
  setShowSummaryOptions
}: SummarySectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true)
      await fetchSummaries(sessionId)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!showSummaryOptions && summaries.length === 0 && !detailedSummary) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Summary Options - Only shown when showSummaryOptions is true */}
      {showSummaryOptions && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Generate Summary</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Summary Type
              </label>
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value as 'quick' | 'detailed' | 'medical_notes')}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="quick">Quick Summary</option>
                <option value="detailed">Detailed Summary</option>
                <option value="medical_notes">Medical Notes</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isFetchingSummaries && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600">Generating {summaryType} summary...</p>
        </div>
      )}

      {/* Detailed Summary */}
      {detailedSummary && (
        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-purple-800">Detailed Summary</h3>
            <span className="text-xs text-gray-500">
              {new Date(detailedSummary.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-gray-800 whitespace-pre-line">{detailedSummary.content}</p>
        </div>
      )}

      {/* Other Summaries */}
      {summaries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Summaries</h3>
          {summaries.map((summary) => (
            <div key={summary.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {summary.summary_type.charAt(0).toUpperCase() + summary.summary_type.slice(1)} Summary
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(summary.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-line">{summary.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}