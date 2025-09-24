import { motion } from "framer-motion";

interface EventCardProps {
  title: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  collaborators?: { name: string }[];
}

const getCategoryStyles = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "work":
      return "text-white border-current";
    case "family":
      return "text-white border-current";
    case "personal":
      return "text-white border-current";
    case "travel":
      return "text-white border-current";
    default:
      return "bg-primary text-primary-foreground border-primary";
  }
};

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "work":
      return "💼";
    case "family":
      return "👨‍👩‍👧‍👦";
    case "personal":
      return "👤";
    case "travel":
      return "✈️";
    default:
      return "📝";
  }
};

export function EventCard({
  title,
  category,
  startTime,
  endTime,
  collaborators,
}: EventCardProps) {
  const timeRange =
    startTime && endTime
      ? `${new Date(startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(endTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "";

  const collaboratorNames = collaborators?.map((c) => c.name).join(":") || "";

  const categoryColor = category?.toLowerCase() === 'work' ? 'var(--category-work)' :
                        category?.toLowerCase() === 'family' ? 'var(--category-family)' :
                        category?.toLowerCase() === 'personal' ? 'var(--category-personal)' :
                        category?.toLowerCase() === 'travel' ? 'var(--category-travel)' :
                        undefined;

  return (
    <motion.div
      className={`p-2 rounded text-sm cursor-move border-2 ${getCategoryStyles(
        category
      )}`}
      style={categoryColor ? { backgroundColor: categoryColor } : {}}
      whileHover={{ scale: 1.05 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
    >
      <div className="flex items-center gap-1">
        <span className="text-xs">{getCategoryIcon(category)}</span>
        <span className="font-medium truncate">{title}</span>
      </div>
      {timeRange && <div className="text-xs opacity-90 mt-1">{timeRange}</div>}
      {collaboratorNames && (
        <div className="text-xs opacity-75 mt-1">{collaboratorNames}</div>
      )}
    </motion.div>
  );
}
