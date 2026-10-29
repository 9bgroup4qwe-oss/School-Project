import { Check, Circle } from 'lucide-react';

interface Phase {
  id: string;
  title: string;
  description: string;
}

interface ProgressBarProps {
  phases: Phase[];
  currentPhase: number;
  completed: boolean;
}

export function ProgressBar({ phases, currentPhase, completed }: ProgressBarProps) {
  const progressPercentage = (currentPhase / (phases.length - 1)) * 100;

  return (
    <div className="progress-container">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="progress-phases">
        {phases.map((phase, index) => {
          const isActive = index === currentPhase;
          const isCompleted = index < currentPhase || completed;

          return (
            <div
              key={phase.id}
              className={`progress-phase ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="progress-icon">
                {isCompleted ? (
                  <div className="icon-completed">
                    <Check size={16} />
                  </div>
                ) : (
                  <Circle size={20} />
                )}
              </div>

              <div className="progress-info">
                <h4 className="progress-title">{phase.title}</h4>
                <p className="progress-description">{phase.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}