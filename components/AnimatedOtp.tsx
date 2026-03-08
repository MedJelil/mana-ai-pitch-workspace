"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type AnimatedOTPInputProps = {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  register?: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  cardTitle?: string;
  cardDescription?: string;
};

const AnimatedOTPInput = ({
  length = 6,
  value: controlledValue,
  onChange,
  onComplete,
  register,
  error,
  disabled = false,
  autoFocus = true,
  className,
  cardTitle,
  cardDescription,
}: AnimatedOTPInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null,
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const prevControlledValueRef = useRef<string | undefined>(controlledValue);

  const isControlled = controlledValue !== undefined;

  // Initialize values from controlled value
  useEffect(() => {
    if (
      isControlled &&
      controlledValue &&
      controlledValue !== prevControlledValueRef.current
    ) {
      const newValues = Array(length).fill("");
      controlledValue.split("").forEach((char: string, idx: number) => {
        if (idx < length) {
          newValues[idx] = char;
        }
      });
      startTransition(() => {
        setValues(newValues);
      });
      prevControlledValueRef.current = controlledValue;
    }
  }, [controlledValue, isControlled, length]);

  // Update active index based on filled inputs
  useEffect(() => {
    const firstEmptyIndex = values.findIndex((val) => !val);
    const newActiveIndex =
      firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    if (newActiveIndex !== activeIndex) {
      startTransition(() => {
        setActiveIndex(newActiveIndex);
      });
    }
  }, [values, length, activeIndex]);

  // Auto-focus first empty input
  useEffect(() => {
    if (autoFocus && focusedIndex !== null) {
      const firstEmptyIndex = values.findIndex((val) => !val);
      const indexToFocus =
        firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
      if (indexToFocus >= 0 && inputRefs.current[indexToFocus]) {
        inputRefs.current[indexToFocus]?.focus();
      }
    }
  }, [autoFocus, focusedIndex, values, length]);

  const applyValues = useCallback(
    (newValues: string[]) => {
      setValues(newValues);

      const combinedValue = newValues.join("");

      if (onChange) {
        onChange(combinedValue);
      }

      if (register?.onChange) {
        register.onChange({
          target: { name: register.name, value: combinedValue },
        });
      }

      return combinedValue;
    },
    [onChange, register],
  );

  const syncFromString = useCallback(
    (rawValue: string) => {
      const sanitized = rawValue.replace(/\D/g, "").slice(0, length);
      const newValues = Array(length).fill("");

      sanitized.split("").forEach((char, idx) => {
        newValues[idx] = char;
      });

      const combinedValue = applyValues(newValues);

      const nextEmptyIndex = newValues.findIndex((val) => !val);
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      if (focusIndex < length) {
        inputRefs.current[focusIndex]?.focus();
      }

      if (!newValues.includes("") && onComplete) {
        onComplete(combinedValue);
      }
    },
    [applyValues, length, onComplete],
  );

  const updateValue = useCallback(
    (index: number, newValue: string) => {
      const newValues = [...values];
      newValues[index] = newValue.slice(-1); // Only take last character
      const combinedValue = applyValues(newValues);

      // Move to next input if value entered
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete when all digits are filled
      if (newValue && index === length - 1 && !newValues.includes("")) {
        if (onComplete) {
          onComplete(combinedValue);
        }
      }
    },
    [values, length, applyValues, onComplete],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (values[index]) {
        updateValue(index, "");
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateValue(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Delete") {
      updateValue(index, "");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    const pastedArray = pastedData
      .split("")
      .filter((char) => /^\d$/.test(char));

    const newValues = Array(length).fill("");
    pastedArray.forEach((char, idx) => {
      if (idx < length) {
        newValues[idx] = char;
      }
    });
    const combinedValue = applyValues(newValues);

    const nextEmptyIndex = newValues.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    if (focusIndex < length) {
      inputRefs.current[focusIndex]?.focus();
    }

    if (!newValues.includes("") && onComplete) {
      onComplete(combinedValue);
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      updateValue(index, inputValue);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        name={register?.name ?? "otp"}
        value={values.join("")}
        onChange={(e) => syncFromString(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative",
          "flex items-center justify-center",
          "min-h-40 w-full max-w-[450px] mx-auto",
          "rounded-md",
        )}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
          <div className="flex w-full items-center justify-center gap-2 sm:gap-3">
            {Array.from({ length }).map((_, idx) => {
              const inputValue = values[idx] || "";
              const isActive = activeIndex === idx;
              const isFocused = focusedIndex === idx;

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative flex h-11 w-9 sm:h-12 sm:w-11 items-center justify-center rounded-md",
                    "bg-linear-to-br from-neutral-100 to-neutral-50",
                    "dark:from-neutral-800 dark:to-neutral-800",
                    "border transition-all",
                    isFocused && !error
                      ? "border-primary/50"
                      : error
                        ? "border-destructive"
                        : "hover:border-primary/50",
                  )}
                >
                  {/* Glow animation on active/focused input */}
                  {(isActive || isFocused) && !error && (
                    <motion.div
                      layoutId="glow"
                      className="absolute inset-0 rounded-md border border-primary/50"
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      style={{
                        boxShadow: "inset 0 0 12px rgba(223, 105, 162, 0.2)",
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="absolute inset-0 h-full w-full"
                        strokeWidth="0.4"
                      >
                        <path
                          d="M 3 19 h 14"
                          className="stroke-primary/50 dark:stroke-cyan-500"
                        />
                      </svg>
                    </motion.div>
                  )}

                  {/* Input field */}
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                      if (register?.ref && idx === 0) {
                        if (typeof register.ref === "function") {
                          register.ref(el);
                        } else if (register.ref) {
                          (
                            register.ref as React.MutableRefObject<HTMLInputElement | null>
                          ).current = el;
                        }
                      }
                    }}
                    type="text"
                    inputMode="numeric"
                    name={idx === 0 ? register?.name : undefined}
                    maxLength={1}
                    value={inputValue}
                    disabled={disabled}
                    onChange={(e) => handleInput(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    onFocus={() => setFocusedIndex(idx)}
                    onBlur={(e) => {
                      setFocusedIndex(null);
                      if (register?.onBlur && idx === length - 1) {
                        register.onBlur(e);
                      }
                    }}
                    className={cn(
                      "absolute inset-0 w-full h-full",
                      "text-center text-lg sm:text-xl font-semibold",
                      "bg-transparent border-0 outline-none",
                      "text-foreground",
                      "caret-primary/50",
                    )}
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    aria-label={`Digit ${idx + 1} of ${length}`}
                  />

                  {/* Display digit with animation */}
                  <AnimatePresence mode="wait">
                    {inputValue && (
                      <motion.span
                        key={inputValue}
                        initial={{ opacity: 0, scale: 0.5, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 10 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                        className={cn(
                          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                          "pointer-events-none",
                          "text-lg sm:text-xl font-semibold text-foreground",
                          isFocused && "text-primary/50",
                        )}
                      >
                        {inputValue}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Error pulse animation */}
                  {error && isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-md border border-destructive"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      style={{
                        boxShadow: "inset 0 0 12px rgba(239, 68, 68, 0.5)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card info */}
        {(cardTitle || cardDescription) && (
          <div className="absolute top-4 left-0 w-full px-4">
            {cardTitle && (
              <h3 className="text-sm font-semibold text-foreground">
                {cardTitle}
              </h3>
            )}
            {cardDescription && (
              <p className="mt-2 text-xs text-muted-foreground">
                {cardDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedOTPInput;
