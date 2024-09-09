import React from "react";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex space-x-2">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === currentStep ? "bg-green-500 scale-125" : "bg-gray-600"
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
