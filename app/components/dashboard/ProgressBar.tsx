// ./dashboard/ProgressBar.tsx
import clsx from "clsx";
import Image from 'next/image';
interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="ot-min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto mt-4">
            <Image
                src="/loadingIllustrations.svg"
                alt="Loading Illustration"
                width={335}
                height={214}
                className="w-full max-w-md"
                />
        
        <div
            className="w-full bg-gray-200 rounded-full h-2 mt-4"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Audio processing progress"
        >
            <div
            className={clsx(
                "bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            )}
            style={{ width: `${progress}%` }}
            />
        </div>
            <div className="text-center justify-between mt-2">
            <span className="text-sm font-medium text-blue-600">
            {Math.round(progress)}%
            </span>
        </div>
        <div className="text-center p-6">
            Convert Call Audio to Summary in Text Format with 
            Sentiment Analysis and AI-Based Positive/Negative Insights
        </div>
        </div>
    </div>
  );
};

export default ProgressBar;