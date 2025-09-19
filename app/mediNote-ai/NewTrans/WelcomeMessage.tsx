"use client";
import { LoganimationsIcon, LoganimationsIconWhite } from "../../chat-ui/components/icons";
import Image from 'next/image';

interface WelcomeMessageProps {
  username: string | null;
}

export default function WelcomeMessage({ username }: WelcomeMessageProps) {
  return (
    <div className="flex justify-between ">
      <div className="flex flex-col items-left justify-center mb-4">
        <LoganimationsIconWhite width={73} />
        <div className="text-5xl font-bold w-2xl otitle mt-4 mb-4">
          Hi, {username}
          <br />
          What would like to know?
        </div>
        <p className="osubtitle-white text-base mb-4">
          Tap to start recording your patient visit. 
          <br />
          Get clean summaries instantly
        </p>
      </div>
      <div className="images-ill-mess absolute">
              {/* <Image 
                    src="/MediNote-AI.png" 
                    alt="I Search" 
                    width={380} 
                    height={380} 
                    className="imagfilter"
                /> */}

                 {/* <Image 
                    src="/AIDocAssistmainpage.png" 
                    alt="I Search" 
                    width={380} 
                    height={380} 
                    className="imagfilter-AI "
                /> */}

                <Image 
                    src="/audio-clip-illustrations-mess.svg" 
                    alt="I Search" 
                    width={380} 
                    height={380} 
                    className="imagfilter-AI "
                />

                {/* audio-clip-illustrations-mess.svg */}
      </div>
    </div>
  );
}