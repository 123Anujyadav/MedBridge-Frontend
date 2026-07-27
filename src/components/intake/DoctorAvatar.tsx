import React from "react";

interface DoctorAvatarProps {
  photoUrl: string;
  name: string;
  isOnline?: boolean;
  size?: "md" | "lg";
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  photoUrl,
  name,
  isOnline = true,
  size = "lg",
}) => {
  const sizeClasses = size === "lg" ? "h-28 w-28" : "h-24 w-24";

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <div
        className={`relative overflow-hidden rounded-full border-4 border-card shadow-md transition-transform duration-300 group-hover:scale-105 ${sizeClasses}`}
      >
        <img
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";
          }}
        />
      </div>

      {/* Online indicator dot */}
      {isOnline && (
        <span
          className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card p-0.5 shadow-md"
          title="Online Now"
        >
          <span className="h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
        </span>
      )}
    </div>
  );
};
