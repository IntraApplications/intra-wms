"use client";

import React, { useState } from "react";
import Image from "next/image";
import IntraLogo from "@/_assets/intra-icon-large-transparent.png";
import Button from "@/_common/components/Button";
import Input from "@/_common/components/Input";
import ProgressDots from "@/_common/components/ProgressDots";
import { AnimatePresence, motion } from "framer-motion";

const steps = ["welcome", "workspace-name"];

export default function SetupProcess() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const Welcome = () => (
    <div className="flex flex-col items-center text-center max-w-[500px]">
      <h1 className="text-neutral text-2xl font-bold mb-4">Welcome to Intra</h1>
      <p className="text-accent text-[14px] mb-8">
        Intra helps you streamline software development, manage workspaces, and
        collaborate efficiently.
      </p>
      <div className="w-[300px] mt-4">
        <Button
          text="Get Started"
          type="button"
          colorType="tertiary"
          handleClick={nextStep}
        />
      </div>
    </div>
  );

  const WorkspaceName = () => (
    <div className="flex-grow flex items-center justify-center">
      <div className="w-[450px] px-8">
        <div className="flex flex-col items-center">
          <h1 className="text-neutral text-2xl font-bold mb-4 text-center">
            Create a new workspace
          </h1>
          <p className="text-accent text-[14px] leading-5 mb-4 text-center">
            Workspaces are shared environments where teams collaborate
            effortlessly on projects and tasks, ensuring smooth workflows
          </p>
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
          >
            <Input
              label="Workspace Name"
              id="workspace-name"
              placeholder="Intra Applications"
              type="text"
            />
            <Input
              label="Workspace URL"
              id="company-size"
              placeholder="intra.com/"
              type="select"
            />
            <div className="mt-12">
              <Button text="Continue" type="submit" colorType="tertiary" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (steps[currentStep]) {
      case "welcome":
        return <Welcome />;
      case "workspace-name":
        return <WorkspaceName />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-between h-screen bg-primary">
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={IntraLogo}
                alt="Intra Logo"
                width={80}
                height={80}
                className="mb-4"
              />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex justify-center mb-8">
        <ProgressDots currentStep={currentStep} totalSteps={steps.length} />
      </div>
    </div>
  );
}
