"use client";

import { StepNavigationButtons } from "./StepNavigationButtons";

interface StepOneProps {
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function StepOne({
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
}: StepOneProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Step 1</h2>
        <p className="mt-2 text-muted-foreground">
          Add your content here.
        </p>
      </div>
      <StepNavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </div>
  );
}
