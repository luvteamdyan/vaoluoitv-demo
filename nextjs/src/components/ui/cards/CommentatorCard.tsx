import { cn } from "@/lib/utils";

export interface CommentatorCardProps {
  name: string;
  avatar?: string;
  isLive?: boolean;
  className?: string;
}

export default function CommentatorCard({ 
  name, 
  avatar,
  className 
}: CommentatorCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      className
    )}>
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden mb-2">
        {avatar ? (
          <img
            src={avatar}
            alt={`${name} avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={cn(
          "w-full h-full flex items-center justify-center text-white font-bold text-lg",
          avatar ? "hidden" : ""
        )}>
          {name.charAt(0)}
        </div>
      </div>
      
      {/* Name */}
      <div className="text-white text-xs font-semibold text-center leading-tight">
        {name}
      </div>
    </div>
  );
}


