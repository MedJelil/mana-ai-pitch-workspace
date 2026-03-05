"use client";

import { StepNavigationButtons } from "./StepNavigationButtons";

interface StepTwoProps {
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function StepTwo({
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
}: StepTwoProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Step 2</h2>
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
