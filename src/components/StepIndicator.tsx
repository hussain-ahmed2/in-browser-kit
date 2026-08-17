import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="flex items-center justify-center mb-2 animate-fade-in">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 shrink-0",
                  isCompleted &&
                    "bg-gradient-to-br from-brand to-glow/70 text-brand-foreground shadow-[0_0_16px_-2px] shadow-brand/50",
                  isCurrent &&
                    "bg-brand/10 text-brand ring-2 ring-brand/40 shadow-[0_0_20px_-4px] shadow-brand/45",
                  isPending && "bg-muted text-muted-foreground"
                )}
              >
                {isCurrent && (
                  <span
                    className="absolute inset-0 rounded-full ring-2 ring-brand/25 animate-glow-pulse"
                    aria-hidden="true"
                  />
                )}
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:inline transition-colors duration-300",
                  isCurrent && "text-foreground",
                  isCompleted && "text-foreground/70",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 sm:w-12 h-0.5 mx-3 rounded-full bg-border overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r from-brand to-glow transition-all duration-500",
                    index < currentStep ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
