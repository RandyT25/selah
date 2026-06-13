import { cn } from "@/lib/utils/cn";

interface Props {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }: Props) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-8 px-4" : "py-16 px-4",
      className
    )}>
      {Icon && (
        <div className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          compact ? "w-10 h-10" : "w-14 h-14"
        )}>
          <Icon className={cn("text-muted-foreground", compact ? "h-5 w-5" : "h-7 w-7")} />
        </div>
      )}
      <h3 className={cn("font-semibold", compact ? "text-sm" : "text-base")}>{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground mt-1 max-w-xs", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
