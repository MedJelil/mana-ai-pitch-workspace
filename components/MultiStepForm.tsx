"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { StepOne, StepTwo, StepThree, StepIndicator } from "./steps";

const steps = [
  { id: 1, title: "Step 1", component: StepOne },
  { id: 2, title: "Step 2", component: StepTwo },
  { id: 3, title: "Step 3", component: StepThree },
];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const nextStep = () => {
    setCompletedSteps((prev) => [...prev, currentStep]);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <Card className="p-8">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <div className="mt-8">
        <CurrentStepComponent
          onNext={nextStep}
          onPrev={prevStep}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === steps.length}
        />
      </div>
    </Card>
  );
}
