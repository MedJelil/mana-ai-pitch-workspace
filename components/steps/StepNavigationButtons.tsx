"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepNavigationButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  nextButtonClassName?: string;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
  prevButtonText?: string;
}

const defaultNext = "Next step";
const defaultPrev = "Previous";
const defaultSubmit = "Submit";

export function StepNavigationButtons({
  onPrev,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  isSubmitting = false,
  nextButtonClassName = "px-8",
  nextButtonText,
  nextButtonDisabled,
  prevButtonText,
}: StepNavigationButtonsProps) {
  const getNextButtonText = () => {
    if (nextButtonText) return nextButtonText;
    if (isSubmitting) return "Submitting…";
    if (isLastStep) return defaultSubmit;
    return defaultNext;
  };

  const getPrevButtonText = () => prevButtonText ?? defaultPrev;

  return (
    <div className="flex justify-between">
      {!isFirstStep && (
        <Button type="button" onClick={onPrev} variant="outline">
          <ArrowLeft className={cn("w-4 h-4 mr-2")} />
          {getPrevButtonText()}
        </Button>
      )}
      {isFirstStep && <div />}
      <Button
        type={isLastStep ? "submit" : "button"}
        onClick={onNext}
        className={nextButtonClassName}
        disabled={
          nextButtonDisabled !== undefined ? nextButtonDisabled : isSubmitting
        }
      >
        {getNextButtonText()}
      </Button>
    </div>
  );
}
