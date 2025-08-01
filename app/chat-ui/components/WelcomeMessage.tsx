"use client";
import { LoganimationsIcon } from "../components/icons";
import Image from 'next/image';

interface WelcomeMessageProps {
  username: string | null;
}

export default function WelcomeMessage({ username }: WelcomeMessageProps) {
  return (
    <div className="flex justify-between ">
      <div className="flex flex-col items-left justify-center mb-4">
        <LoganimationsIcon width={73} />
        <div className="text-5xl font-bold w-2xl otitle mt-4 mb-4">
          Hi there, {username}
          <br />
          What would like to know?
        </div>
        <p className="osubtitle text-base mb-4">
          Tap to start recording your patient visit. 
          <br />
          Get clean summaries instantly
        </p>
      </div>
      <div className="images-ill">
              <Image 
                    src="/AIDocAssist-img.png" 
                    alt="I Search" 
                    width={280} 
                    height={280} 
                    className="imagfilter"
                />
      </div>
    </div>
  );
}