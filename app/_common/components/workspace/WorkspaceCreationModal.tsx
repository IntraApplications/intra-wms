import React, { useState, useEffect } from "react";
import Button from "@/_common/components/Button";
import ProgressDots from "@/_common/components/ProgressDots";
import VCSSelection from "./steps/VCSSelection";
import RepositorySelection from "./steps/RepositorySelection";
import BranchSelection from "./steps/BranchSelection";
import EnvironmentSetup from "./steps/EnvironmentSetup";
import ReviewSetup from "./steps/ReviewSetup";
import { CodeOutlined, ChevronRight } from "@mui/icons-material";

interface WorkspaceCreationModalProps {
  onClose: () => void;
}

const steps = [
  { title: "VCS Integration", component: VCSSelection },
  { title: "Repository Selection", component: RepositorySelection },
  { title: "Branch Selection", component: BranchSelection },
  { title: "Environment Setup", component: EnvironmentSetup },
  { title: "Review", component: ReviewSetup },
];

const WorkspaceCreationModal: React.FC<WorkspaceCreationModalProps> = ({
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workspaceData, setWorkspaceData] = useState({});
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const sizes = [
      { width: 800, height: 650 }, // VCS Selection
      { width: 700, height: 650 }, // Repository Selection
      { width: 600, height: 500 }, // Branch Selection
      { width: 750, height: 600 }, // Environment Setup
      { width: 700, height: 700 }, // Review
    ];

    setModalSize(sizes[currentStep]);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Workspace creation complete:", workspaceData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateWorkspaceData = (data: any) => {
    setWorkspaceData({ ...workspaceData, ...data });
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div
      className="bg-primary rounded-[5px] border border-border overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
      style={{ width: `${modalSize.width}px`, height: `${modalSize.height}px` }}
    >
      <div className="border-b border-gray-700 h-[54px] px-6 flex justify-between items-center">
        <div className="flex items-center text-[11px] text-gray-400">
          <CodeOutlined fontSize="small" className="mr-2" />
          <span>Team - Engineering</span>
          <ChevronRight fontSize="small" className="mx-2" />
          <span>Virtual Workspaces</span>
          <ChevronRight fontSize="small" className="mx-2" />
          <span>New Workspace</span>
          <ChevronRight fontSize="small" className="mx-2" />
          <span className="text-tertiaryBorder">
            {steps[currentStep].title}
          </span>
        </div>
      </div>
      <div className="p-6 flex-grow overflow-y-auto">
        <CurrentStepComponent
          workspaceData={workspaceData}
          updateWorkspaceData={updateWorkspaceData}
        />
      </div>
      <div className="border-t border-gray-700 h-[54px] px-6 flex justify-between items-center">
        {/*
        <Button
          text="Back"
          size="small"
          type="button"
          colorType="secondary"
          handleClick={handleBack}
          disabled={currentStep === 0}
        />
  */}
        <div></div>
        <div className="flex justify-center items-center">
          <ProgressDots currentStep={currentStep} totalSteps={steps.length} />
        </div>
        <div></div>
        {/*
        <Button
          text={currentStep === steps.length - 1 ? "Create" : "Next"}
          size="small"
          type="button"
          colorType="secondary"
          handleClick={handleNext}
        />
  */}
      </div>
    </div>
  );
};

export default WorkspaceCreationModal;
