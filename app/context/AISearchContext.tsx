"use client"

import React, { createContext, useState, useContext, ReactNode } from "react"

interface SearchResult {
  id: string
  title: string
  summary: string
  // add more fields based on your API response
}

interface Message {
  sender: "user" | "ai"
  content: string
  fileType?: string
  isLoading?: boolean; // Add this optional property
  followup_questions?: string[]; // Add this to store follow-up questions
}

interface AISearchContextType {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  setResults: (r: SearchResult[]) => void
  isLoading: boolean
  setIsLoading: (b: boolean) => void
  conversationId: string | null
  setConversationId: (id: string) => void
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  conversationHistory: ConversationMessage[]
  setConversationHistory: React.Dispatch<
    React.SetStateAction<ConversationMessage[]>
  >
  isOpen?: boolean
  openPopup?: () => void
  closePopup?: () => void
}

interface ConversationMessage {
  message_id: string
  query: string
  response: string
  followups: string[]
  timestamp: string
  feedback: string | null
}

const AISearchContext = createContext<AISearchContextType | undefined>(
  undefined
)

export const AISearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([])
  const [isOpen, setIsOpen] = useState(false)

  const openPopup = () => setIsOpen(true)
  const closePopup = () => setIsOpen(false)

  return (
    <AISearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        setResults,
        isLoading,
        setIsLoading,
        conversationId,
        setConversationId,
        messages,
        setMessages,
        conversationHistory,
        setConversationHistory,
        isOpen,
        openPopup,
        closePopup,
      }}
    >
      {children}
    </AISearchContext.Provider>
  )
}

export const useAISearch = () => {
  const context = useContext(AISearchContext)
  if (!context)
    throw new Error("useAISearch must be used within AISearchProvider")
  return context
}
