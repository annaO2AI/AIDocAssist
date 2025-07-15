import { Mail, AlertCircle } from "lucide-react"
import Image from 'next/image';

const EmailSentTags = ({ emailSent }: { emailSent: string[] }) => {
  const getStyle = (label: string) => {
    if (label.toLowerCase().includes("action")) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        icon: <AlertCircle className="w-6 h-6 mr-1 text-red-600 text-md" />,
      }
    }

    return {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
      icon: <Mail className="w-6 h-6 mr-1 text-blue-600 text-md" />,
    }
  }

  return (
    <div className="emalsent-tag">
      <div className="mb-6 px-12 py-8 flex gap-3 border-b border-gray-250">
        <Image
          src="/email-mail-svgrepo.svg"
          alt="Email"
          width={50}
          height={50}
        />
        <div className="flex flex-col">
         <span className="text-xl font-semibold ot-title">Emails Sent</span> 
         <span className="text-base osubtitle "> Received follow-up email after call.</span> 
         </div>
       </div>
      <div className="flex px-10 py-6  flex-col  gap-4 mx-8 mb-10">
        {emailSent.map((label, idx) => {
          const style = getStyle(label)
          return (
            <div
              key={idx}
              className={`flex items-center p-4 rounded-full text-md font-medium gap-2 ${style.bg} ${style.text} border ${style.border}`}
            >
              {style.icon}
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EmailSentTags
