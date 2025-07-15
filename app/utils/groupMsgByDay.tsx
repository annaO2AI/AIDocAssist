import {
  format,
  isToday,
  isYesterday,
  differenceInCalendarDays,
  parseISO,
} from "date-fns"

interface ConversationMessage {
  message_id: string
  query: string
  response: string
  followups: string[]
  timestamp: string
  feedback: string | null
}

export const groupMessagesByDay = (messages: ConversationMessage[]) => {
  const groups: Record<string, ConversationMessage[]> = {}

  messages.forEach((msg) => {
    const date = parseISO(msg.timestamp)
    let label = ""

    if (isToday(date)) {
      label = "Today"
    } else if (isYesterday(date)) {
      label = "Yesterday"
    } else {
      const diff = differenceInCalendarDays(new Date(), date)
      if (diff <= 10) {
        label = `${diff} days ago`
      } else {
        label = format(date, "MMM dd, yyyy")
      }
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(msg)
  })

  return groups
}
