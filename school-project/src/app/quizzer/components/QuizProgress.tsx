import { LucideIcon } from 'lucide-react';

interface QuizProgressProps {
  steps: Array<{
    id: string;
    title: string;
    icon: LucideIcon;
  }>;
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function QuizProgress({ steps, currentStep, onStepClick }: QuizProgressProps) {
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="quiz-progress-container">
      <div className="quiz-progress-line">
        <div
          className="quiz-progress-line-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const canClick = isCompleted || (index === currentStep + 1);

        return (
          <div
            key={step.id}
            className={`quiz-progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => canClick && onStepClick(index)}
          >
            <div className="quiz-progress-pill">
              <Icon className="quiz-progress-icon" />
              <span>{step.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}