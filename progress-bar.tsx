import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  className,
  size = "md",
  color = "primary",
  showLabel = false,
}: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Size variations
  const heightClasses = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };
  
  // Color variations
  const colorClasses = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  return (
    <div className="w-full">
      <div className={cn("relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", heightClasses[size], className)}>
        <div 
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-300", colorClasses[color])}
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      {showLabel && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
          {normalizedProgress}%
        </div>
      )}
    </div>
  );
}
