import React, { useState, useMemo, useEffect } from "react";
import assistantService from "@/lib/assistant-service";
import { HistoryHeader } from "./HistoryHeader";
import { SearchBar } from "./SearchBar";
import { HistoryFilters } from "./HistoryFilters";
import { PinnedSection } from "./PinnedSection";
import { ConversationGroup } from "./ConversationGroup";
import { EmptyHistory } from "./EmptyHistory";
import { HistorySkeleton } from "./HistorySkeleton";
import { type ConversationHistoryItem } from "./ConversationPreview";

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (item: ConversationHistoryItem) => void;
  onStartNewConversation: () => void;
}


export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onStartNewConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistoryItem[]>([]);

  // Load the patient's real conversations whenever the drawer opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const rows = await assistantService.listConversations(50);
        if (cancelled) return;
        setConversations(
          rows.map((row) => {
            const updated = new Date(row.updated_at);
            const validDate = !Number.isNaN(updated.getTime());
            return {
              id: row.conversation_id,
              title: row.title,
              preview: row.preview,
              date: validDate ? updated.toLocaleDateString() : "",
              time: validDate
                ? updated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              duration: `${row.message_count} messages`,
              messageCount: row.message_count,
              symptoms: row.symptoms,
              specialist: row.specialist ?? undefined,
              urgency:
                row.emergency_risk === "critical"
                  ? "Emergency"
                  : row.emergency_risk === "moderate"
                    ? "High"
                    : "Low",
              status: "Completed",
            } satisfies ConversationHistoryItem;
          })
        );
      } catch {
        // Drawer degrades to an empty list rather than breaking the chat page.
        if (!cancelled) setConversations([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      // Search match
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query) ||
        item.symptoms.some((s) => s.toLowerCase().includes(query)) ||
        (item.specialist && item.specialist.toLowerCase().includes(query));

      // Filter chip match
      let matchesFilter = true;
      if (selectedFilter === "Pinned") matchesFilter = !!item.isPinned;
      else if (selectedFilter === "Favorites") matchesFilter = !!item.isFavorite;
      else if (selectedFilter === "Today") matchesFilter = item.date.includes("Today");
      else if (selectedFilter === "Yesterday") matchesFilter = item.date.includes("Yesterday");
      else if (selectedFilter !== "All") {
        matchesFilter =
          item.symptoms.some((s) => s.toLowerCase().includes(selectedFilter.toLowerCase())) ||
          item.title.toLowerCase().includes(selectedFilter.toLowerCase());
      }

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, selectedFilter]);

  const pinnedItems = useMemo(
    () => filteredConversations.filter((item) => item.isPinned),
    [filteredConversations]
  );

  const todayItems = useMemo(
    () => filteredConversations.filter((item) => item.date.includes("Today")),
    [filteredConversations]
  );

  const yesterdayItems = useMemo(
    () => filteredConversations.filter((item) => item.date.includes("Yesterday")),
    [filteredConversations]
  );

  const olderItems = useMemo(
    () =>
      filteredConversations.filter(
        (item) => !item.date.includes("Today") && !item.date.includes("Yesterday")
      ),
    [filteredConversations]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity"
      />

      {/* Right-side Drawer (Desktop/Tablet) or Full Screen (Mobile) */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full sm:w-[420px] lg:w-[460px] flex-col bg-card p-5 shadow-2xl transition-transform duration-300 animate-slide-in-right">
        {/* Header */}
        <HistoryHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto space-y-4 pt-4 custom-scrollbar pr-1">
          {/* Search Bar */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Filter Chips */}
          <HistoryFilters selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />

          {isLoading ? (
            <HistorySkeleton />
          ) : filteredConversations.length === 0 ? (
            <EmptyHistory
              onStartNew={() => {
                onStartNewConversation();
                onClose();
              }}
            />
          ) : (
            <div className="space-y-5 pt-2">
              {/* Pinned Section */}
              <PinnedSection pinnedItems={pinnedItems} onSelectConversation={onSelectConversation} />

              {/* Grouped Sections */}
              <ConversationGroup title="Today" items={todayItems} onSelectConversation={onSelectConversation} />
              <ConversationGroup title="Yesterday" items={yesterdayItems} onSelectConversation={onSelectConversation} />
              <ConversationGroup title="Older Consultations" items={olderItems} onSelectConversation={onSelectConversation} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
