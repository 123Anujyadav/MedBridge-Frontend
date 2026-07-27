import { useState } from "react";
import { Search, Bell, HelpCircle } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

interface TopBarProps {
  searchPlaceholder: string;
  userName: string;
  userRole: string;
  avatarUrl?: string;
  onSearch?: (query: string) => void;
}

export function TopBar({ searchPlaceholder, userName, userRole, avatarUrl, onSearch }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const safeName = userName || "User";

  return (
    <header className="glass-nav fixed left-sidebar-width right-0 top-0 z-40 flex h-top-nav-height items-center justify-between border-b border-border-subtle/50 bg-card/80 px-8">
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="group relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-full border-none bg-surface-container-low py-2.5 pl-10 pr-4 text-body-sm transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-surface-container">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-surface-container">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-border-subtle" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold leading-none text-foreground">{safeName}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{userRole}</p>
          </div>
          {/* Same circle as before — it now shows the profile photo when one
              is set, and the initials when it is not. */}
          <UserAvatar
            avatarUrl={avatarUrl}
            name={safeName}
            thumb
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 bg-primary-container text-sm font-bold text-primary-foreground"
            )}
          />
        </div>
      </div>
    </header>
  );
}
