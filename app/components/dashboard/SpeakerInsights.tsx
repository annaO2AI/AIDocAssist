import { User, Headset } from "lucide-react"
import Image from 'next/image';
import PopupModal from "./PopupModal";
import { useState } from "react";
import { json } from "stream/consumers";
import AgentRating from './AgentRating';

const SpeakerInsights = ({
  speakerInsights,
  agentRating, // Add agentRating as a prop
  role,
  customerName
}: {
  speakerInsights: { Customer: string; Agent: string };
  agentRating: number;
  role: string;
  customerName:string;
}) => {
  const colorStyles = {
    green: {
      bg: "bg-white",
      border: "border-green-200",
      title: "text-green-800",
      text: "text-green-900",
    },
    blue: {
      bg: "bg-white",
      border: "border-blue-200",
      title: "text-blue-800",
      text: "text-blue-900",
    },
  }

  console.log("spiker insight" + speakerInsights )
  const insights = [
    {
      title: "Customer Insights",
      text: speakerInsights.Customer,
      icon: <User className="w-5 h-5 text-green-600 mr-2" />,
      color: colorStyles["green"],
      src: "/CustomerInsightsCon.svg"
    },
    {
      title: "Agent Insights",
      text: speakerInsights.Agent,
      icon: <Headset className="w-5 h-5 text-blue-600 mr-2" />,
      color: colorStyles["blue"],
      src: "/AgentInsights.svg"
    },
  ]

  const [customerisOpen, CustomerSetIsOpen] = useState(false);
  const [agentisOpen, AgentSetIsOpen] = useState(false);

  const CustomerButtonClick = () => {
    CustomerSetIsOpen(true);
  };

   const AgentButtonClick = () => {
    AgentSetIsOpen(true);
  };

  const customerClose = () => {
    CustomerSetIsOpen(false);
  };

  const agentClose = () => {
    AgentSetIsOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* {insights.map(({ title, text, icon, color, src }, idx) => (
        <div
          key={idx}
          className={`p-12 rounded-xl border boxshadow flex gap-8 ${color.bg} ${color}.border} `}
        >
          <div>
            <Image
              src={src}
              alt="Customer Insights"
              width={250}
              height={57}
            />

          </div>
          <div>
            <div className="flex items-baseline">
              <h3 className={`text-xl font-semibold ${color.title} mb-2`}>
                {title}
              </h3>
            </div>
            <p className={color.text}>{text}</p>
          </div>
        </div>
      ))} */}

      <div className="p-12 rounded-xl  boxshadow flex gap-8 bg-white">
        <div>
            <Image
              src="/CustomerInsightsCon.svg"
              alt="Customer Insights"
              width={250}
              height={57}
            />
          </div>
          <div>
            <div className="flex items-baseline ">
              <h3 className="text-xl font-semibold  mb-2  text-green-700  pb-3">
                Customer Call Insights
              </h3>
            </div>
            <p className="text-green-700">{speakerInsights.Customer}</p>
            {role === "Admin" && (
              <button className="mt-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800" onClick={CustomerButtonClick}>
                View Details
              </button>
            )}
            <PopupModal isOpen={customerisOpen} onClose={customerClose}>
              <div className="p-12">
                {/* Header Section */}
                <div className="flex items-center mb-4 gap-5">
                  <Image
                      src="/CustomerInsightsCon.svg"
                      alt="Customer Insights"
                      width={70}
                      height={70}
                   />
                  <div>
                    <h2 className="text-xl font-semibold  ot-title">Customer Call Insights</h2>
                    <h3 className="text-base mb-2 osubtitle ">Customer: <span>{customerName}</span></h3>
                  </div>
                </div>

                {/* Customer: Peter Section */}
                <div className="flex items-start mb-6 gap-12">
                  <div className="flex-1 w-[65%] pl-12 ml-10">
                    <p className="text-gray-600 mb-2">
                      {speakerInsights.Customer}
                    </p>
                     {/* AI Analysis Call Section */}
                    <div className="mt-6">
                      <div className="flex items-center mb-6 gap-2">
                        <Image
                            src="/aiIcon.svg"
                            alt="Customer Illustration"
                            width={20}
                            height={20}
                        />
                        <h3 className="text-lg font-medium text-gray-700">AI Call Analysis </h3>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg">
                        <div className="text-center border border-green-200 p-6 rounded ">
                          <p className="text-gray-600 font-medium text-green-700">Login Issue Reported</p>
                        </div>
                        <div className="text-gray-500">➔</div>
                        <div className="text-center border border-green-200 p-6 rounded ">
                          <p className="text-gray-600 font-medium text-green-700" >Password Reset</p>
                        </div>
                        <div className="text-gray-500">➔</div>
                        <div className="text-center border border-green-200 p-6 rounded ">
                          <p className="text-gray-600 font-medium text-green-700">Login Successful</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 w-[30%]">
                     <Image
                      src="/CustomerInsightsCon-img.gif"
                      alt="Customer Illustration"
                      width={250}
                      height={250}
                   />
                  </div>
                </div>
              </div>
            </PopupModal>
          </div>
      </div>

      <div className="p-12 rounded-x boxshadow flex gap-8 bg-white">
        <div>
            <Image
              src="/AgentInsights.svg"
              alt="Agent Insights"
              width={250}
              height={57}
            />
          </div>
          <div>
            <div className="flex items-baseline pb-3 justify-between">
              <h3 className="text-xl font-semibold  mb-2 text-blue-700">
                Agent Call Insights
              </h3>
              <div className="flex gap-2 items-center ">
                <div className="osubtitle">Agent Rating :</div>
                <div className=" flex text text-center justify-center items-center p-3 bg-blue-500 text-white w-[40px] h-[40px] rounded text-2xl font-bold">{agentRating}</div>
              </div>
            </div>
            <p className="text-blue-700">{speakerInsights.Agent}</p>
            {role === "Admin" && (
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={AgentButtonClick}>
                View Details
              </button>
            )}
            <PopupModal isOpen={agentisOpen} onClose={agentClose}>
              <div className="p-12">
                {/* Header Section */}
                <div className="flex items-center mb-4 gap-5">
                  <Image
                      src="/AgentInsights.svg"
                      alt="Customer Insights"
                      width={70}
                      height={70}
                   />
                  <div>
                    <h2 className="text-xl font-semibold  ot-title">Agent Insights</h2>
                    <h3 className="text-base mb-2 osubtitle ">Agent:</h3>
                  </div>
                </div>

                {/* Customer: Peter Section */}
                <div className="flex items-start mb-6 gap-12">
                  <div className="flex-1 w-[65%] pl-12 ml-10">
                    <p className="text-gray-600 mb-3">
                      {speakerInsights.Agent}
                    </p>
                    <div className="mt-6 pb-4">
                      <div className="flex items-center  gap-2">
                        <h3 className="text-lg font-medium text-gray-700">Agent Rating </h3>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg">
                        <AgentRating rating={agentRating} /> {/* Pass agentRating */}
                      </div>
                    </div>
                     {/* AI Analysis Call Section */}
                    <div className="mt-6">
                      <div className="flex items-center mb-6 gap-2">
                        <Image
                            src="/AIIconBlue.svg"
                            alt="Customer Illustration"
                            width={20}
                            height={20}
                        />
                        <h3 className="text-lg font-medium text-gray-700">AI Call Analysis </h3>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg">
                        <div className="text-center border border-blue-200 p-6 rounded ">
                          <p className="text-gray-600 font-medium text-blue-700">Login Issue Reported</p>
                        </div>
                        <div className="text-gray-500">➔</div>
                        <div className="text-center border border-blue-200 p-6 rounded ">
                          <p className="text-gray-600 font-medium text-blue-700" >Password Reset</p>
                        </div>
                        <div className="text-gray-500">➔</div>
                        <div className="text-center border border-blue-200 p-6 rounded ">
                          <p className="text-gray-600 font-medium text-blue-700">Login Successful</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 w-[30%]">
                     <Image
                      src="/AgentInsightsCon-img.gif"
                      alt="Customer Illustration"
                      width={250}
                      height={250}
                   />
                  </div>
                </div>
              </div>
            </PopupModal>
          </div>
      </div>

    </div>
  )
}

export default SpeakerInsights
