const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://aisummary-api-usc-geemebfqfmead8f4.centralus-01.azurewebsites.net"
// "https://aisummary-api-fue6a9gxabdceng4.canadacentral-01.azurewebsites.net"

//ai search
const API_BASE_URL_AISEARCH =
  process.env.NEXT_PUBLIC_API_BASE_URL_AISEARCH ||
  "https://ai-search-recruitment-api-hcg0c3bahzexatab.centralus-01.azurewebsites.net/"

//HR search 3.4
const API_BASE_URL_AISEARCH_HR =
  process.env.NEXT_PUBLIC_API_BASE_URL_AISEARCH_HR ||
  "https://ai-search-hr-api-dfbahehtdkaxh7c2.centralus-01.azurewebsites.net/"

//AIOps 2.0
const API_BASE_URL_AISEARCH_AIOPS =
  process.env.NEXT_PUBLIC_API_BASE_URL_AISEARCH_AIOPS ||
  "https://ai-ops-123321-b8e0gnejhydcb7he.centralus-01.azurewebsites.net/"

export const API_ROUTES = {
  audioFiles: `${API_BASE_URL}/audio-files`,
  models: `${API_BASE_URL}/models`,
  processCall: `${API_BASE_URL}/process-call`,
  sentimentGraphInteractive: `${API_BASE_URL}/sentiment-graph-interactive`,
  downloadReport: `${API_BASE_URL}/download-report`,
  // useaccess: `${API_BASE_URL}/get-user-role`,

  //AI Search api's
  upload: `${API_BASE_URL_AISEARCH}/upload`,
  conversations: `${API_BASE_URL_AISEARCH}/conversations`,
  ask: `${API_BASE_URL_AISEARCH}/ask`,
  deleteConversation: (conversation_id: string) =>
    `${API_BASE_URL_AISEARCH}/conversations/${conversation_id}`,

  //HR API
   hrconversations: `${API_BASE_URL_AISEARCH_HR}/api/chatbot/conversations`,
   hrask: `${API_BASE_URL_AISEARCH_HR}/api/chatbot/ask`,
     hrdeleteConversation: (conversation_id: string) =>
    `${API_BASE_URL_AISEARCH_HR}/api/chatbot/conversations/${conversation_id}`,
     useaccess: `${API_BASE_URL_AISEARCH_HR}/api/auth/get-user-role`,

   //AIOPs
   aiopsask: `${API_BASE_URL_AISEARCH_AIOPS}/ask`,
   
}
