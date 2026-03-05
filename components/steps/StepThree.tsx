"use client";

import { StepNavigationButtons } from "./StepNavigationButtons";

interface StepThreeProps {
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function StepThree({
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
}: StepThreeProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Step 3</h2>
        <p className="mt-2 text-muted-foreground">Add your content here.</p>
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
