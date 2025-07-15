"use client";
import { useEffect, useState, useRef } from "react";
import {
  LoganimationsIcon,
   SendIcon,
   AttachemntIcon,
   AIsearchIcon,
   DOCIcon,
   PDFIcon,
   LogIcon
} from "../components/icons";
import { useAISearch } from "../../context/AISearchContext";
import { fetchWithAuth } from "@/app/utils/axios";
import { API_ROUTES } from "../../constants/api";
import { decodeJWT } from "@/app/utils/decodeJWT";
import FollowUpQuestions from "./FollowUpQuestions";
import WelcomeMessage from "./WelcomeMessage"; // Import the new component
import ChatMessages from "./ChatMessages";

export default function Aisearch({ onSend }: { onSend: () => void }) {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const {
    query,
    setQuery,
    isLoading,
    setIsLoading,
    setConversationId,
    setMessages,
    messages,
    conversationId,
    setConversationHistory,
  } = useAISearch();

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.name) {
        setUsername(decoded.name);
      }
    }
  }, []);

  useEffect(() => {
    const fetchConversationId = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.conversations, {
          method: "POST",
        });
        const data = await res.json();
        if (data?.conversation_id) {
          console.log(data.conversation_id);
          setConversationId(data?.conversation_id);
        }
      } catch (err) {
        console.error("Failed to fetch conversation ID:", err);
      }
    };

    fetchConversationId();
  }, [setConversationId]);

  function extractLastResponse(response: string): string {
    // Check if the response has numbered items pattern
    if (response.match(/\d+\s[^0-9]+/)) {
      // Split by numbers followed by space
      const matches = response.match(/(\d+\s[^0-9]+)/g)
      if (matches) {
        // Join with proper line breaks between each numbered item
        return matches.map((item) => item.trim()).join("\n")
      }
    }
    return response
  }

useEffect(() => {
  if (chatContainerRef.current) {
    setTimeout(() => {
      chatContainerRef.current!.scrollTo({
        top: chatContainerRef.current!.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }
  if (inputRef.current && !isLoading) {
    inputRef.current.focus();
  }
}, [messages, isLoading]); // Added isLoading to dependencies

  const sendMessage = async () => {
    if (!query?.trim() && !fileInput) return;

    setIsLoading(true);

    if (query?.trim()) {
      setMessages((prev) => [...prev, { sender: "user", content: query }]);
    }

    setMessages((prev) => [...prev, { sender: "ai", content: "Thinking...", isLoading: true }]);

    setQuery("");

    try {
      if (fileName && fileInput) {
        const formData = new FormData();
        formData.append("file", fileInput);

        const uploadRes = await fetchWithAuth(API_ROUTES.upload, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        if (fileInput) {
          setMessages((prev) =>
            prev.filter((msg) => !msg.isLoading).concat([
              {
                sender: "user",
                content: `📎 ${fileName}`,
                fileType: fileType,
              },
            ])
          );
        }
      }

      if (!query.trim() && !fileInput) {
        setIsLoading(false);
        setFileName("");
        setFileType("");
        setFileInput(null);
        setMessages((prev) => prev.filter((msg) => !msg.isLoading));
        return;
      }

      const res = await fetchWithAuth(API_ROUTES.ask, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          query: query,
        }),
      });

      const data = await res.json();
      const extracted = extractLastResponse(data?.response || "")

      setMessages((prev) =>
        prev.filter((msg) => !msg.isLoading).concat([
          {
            sender: "ai",
           content: extracted || data.response,
            followup_questions: data.followup_questions || [],
          },
        ])
      );
      setConversationHistory(data?.conversation_history);
    } catch (err) {
      console.error("Error during ask:", err);
      setMessages((prev) =>
        prev.filter((msg) => !msg.isLoading).concat([
          { sender: "ai", content: "Something went wrong." },
        ])
      );
    }

    setFileName("");
    setFileType("");
    setFileInput(null);
    setIsLoading(false);

    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFileInput(file);
      setFileName(file.name);
      const extension = file.name.split(".").pop().toLowerCase();
      setFileType(extension);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function getInitials(name: string | null): string {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const initials = getInitials(username);

  // Get the latest AI message for follow-up questions
  const latestAIMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.sender === "ai" && !msg.isLoading);

  return (
    <div id="chat-box-main" ref={chatContainerRef} className="flex flex-col minarea-max-hright">
      
      <div
        className={
          messages.length === 0
            ? "o2AlignSearch-center"
            : "o2AlignSearch-center o2AlignSearchm1-center"
        }
      >
        <div className="flex flex-col gap-3 text-left mt-auto text-xs subtitle w-full max-w-7xl m-auto">
          {messages.length === 0 && <WelcomeMessage username={username} />}
          <div className="flex flex-col h-full">
          <ChatMessages messages={messages} initials={initials} />
            {latestAIMessage && (
              <FollowUpQuestions
                followupQuestions={latestAIMessage.followup_questions || []}
                isLoading={isLoading}
                setQuery={setQuery}
                sendMessage={sendMessage}
                inputRef={inputRef}
              />
            )}
          </div>
          <div className="text-base bottom-0 sticky">
            <div
              className={`flex flex-col w-full w-[100%] px-4 p-2 rounded-xl bg-white border-o2 aisearchinput ${
                isInputFocused ? "aisearchinput-focused" : ""
              }`}
            >
              {fileName && (
                <div className="flex flex-row mb-4">
                  <div className="flex flex-row items-center rounded-md border border-solid border-gray-200 p-4 bg-white gap-4">
                    {fileType === "doc" || fileType === "docx" ? (
                      <DOCIcon width={26} />
                    ) : null}
                    {fileType === "pdf" ? <PDFIcon width={24} /> : null}
                    {fileName && (
                      <p className="text-sm text-gray-600">{fileName}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex-1 text-gray-400 flex items-center space-x-2 mb-2">
                <AIsearchIcon width={36} />
                <input
                  type="text"
                  placeholder="Type your messages here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  disabled={isLoading}
                  className={`w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  ref={inputRef}
                />
              </div>
              <div className="flex flex-row w-full justify-between mb-2">
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 text-white rounded">
                    <AttachemntIcon width={15} />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".doc,.docx,.pdf"
                    />
                  </label>
                </div>
                <button
                  disabled={isLoading}
                  onClick={sendMessage}
                  className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Processing..." : "Send"} <SendIcon width={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}