// ============================================
// Case Timeline & Audit Trail — Doctor Portal
//
// The chronological history of one case: who did what, when, and — for recorded
// events — what the value was before and after.
//
// Two provenance levels are shown honestly rather than blended. A "recorded"
// event was written when it happened and can name its actor; a "derived"
// milestone is read from a clinical row's own timestamp and is labelled as
// such, because the record cannot prove who performed it.
//
// Built from existing primitives: TimelineItem, StatusBadge, FilterBar and the
// portal's standard input/button classes. No new design tokens.
// ============================================
import { useState, useMemo, useCallback } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TimelineItem } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/States";
import { useCaseTimeline } from "@/hooks/useDoctor";
import type { CaseTimelineEvent, TimelineActorType } from "@/types/api";
import { Activity, Search } from "lucide-react";

/** Actor glyphs, so an AI action is never mistaken for a clinician's. */
const ACTOR_GLYPH: Record<TimelineActorType, string> = {
  ai: "🤖",
  doctor: "👨‍⚕️",
  patient: "👤",
  admin: "🛡️",
  system: "⚙️",
};

const ACTOR_TONE: Record<TimelineActorType, "info" | "success" | "warning" | "neutral"> = {
  ai: "info",
  doctor: "success",
  patient: "warning",
  admin: "neutral",
  system: "neutral",
};

const CATEGORIES = [
  { id: "ai", label: "AI Events" },
  { id: "doctor", label: "Doctor Actions" },
  { id: "patient", label: "Patient Actions" },
  { id: "system", label: "System Events" },
  { id: "clinical", label: "Clinical Updates" },
  { id: "reports", label: "Reports" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "appointments", label: "Appointments" },
] as const;

const PAGE_SIZE = 25;

const inputClass = "w-full rounded-xl border border-border-subtle bg-card p-3 text-sm";
const chipBtn =
  "rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container";
const chipActive =
  "rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground";

/** Previous → New, shown only when the backend actually stored both sides. */
function ChangeDiff({ event }: { event: CaseTimelineEvent }) {
  if (event.previous_value == null && event.new_value == null) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle bg-surface-container p-2">
      {event.field_changed && (
        <span className="text-xs font-medium text-muted-foreground">
          {event.field_changed}
        </span>
      )}
      {event.previous_value != null && (
        <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground line-through">
          {event.previous_value}
        </span>
      )}
      {event.previous_value != null && event.new_value != null && (
        <span className="text-xs text-muted-foreground">→</span>
      )}
      {event.new_value != null && (
        <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-foreground">
          {event.new_value}
        </span>
      )}
    </div>
  );
}

interface Props {
  caseId: string;
}

export function CaseTimeline({ caseId }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const query = useMemo(
    () => ({
      case_id: caseId,
      category: selected.length ? selected : undefined,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      skip: 0,
      limit,
    }),
    [caseId, selected, search, dateFrom, dateTo, limit]
  );

  const { data, isLoading, isFetching } = useCaseTimeline(query);

  const toggleCategory = useCallback((id: string) => {
    setLimit(PAGE_SIZE);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const applySearch = useCallback(() => {
    setLimit(PAGE_SIZE);
    setSearch(searchInput.trim());
  }, [searchInput]);

  const events = data?.events ?? [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-border-subtle p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filter History
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              className={selected.includes(c.id) ? chipActive : chipBtn}
            >
              {c.label}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Search keyword, actor or event
            </label>
            <div className="flex gap-2">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="e.g. urgency, Dr. Rao, prescription"
                className={inputClass}
              />
              <button type="button" onClick={applySearch} className={chipBtn}>
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setLimit(PAGE_SIZE); setDateFrom(e.target.value); }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setLimit(PAGE_SIZE); setDateTo(e.target.value); }}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Count */}
      {data && (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant="info" dot>
            {data.total} event{data.total === 1 ? "" : "s"}
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            Showing {events.length} of {data.total}
          </span>
          {isFetching && (
            <span className="text-xs text-muted-foreground">Updating...</span>
          )}
        </div>
      )}

      {/* Events */}
      <div className="rounded-xl border border-border-subtle p-4">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading case history...
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-8 w-8" />}
            title="No Matching Events"
            description="No recorded history matches the current filters."
          />
        ) : (
          <div className="pt-2">
            {events.map((e, i) => (
              <TimelineItem
                key={e.id}
                title={`${ACTOR_GLYPH[e.actor_type] ?? "⚙️"} ${e.title}`}
                timestamp={new Date(e.timestamp).toLocaleString()}
                status={e.actor_type === "ai" ? "info" : e.actor_type === "doctor" ? "success" : "warning"}
                isLast={i === events.length - 1}
                description={
                  <>
                    <span className="block">{e.description}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge variant={ACTOR_TONE[e.actor_type] ?? "neutral"}>
                        {e.actor_label}
                      </StatusBadge>
                      <span className="text-xs text-muted-foreground">{e.actor_name}</span>
                      {e.source === "derived" && (
                        <StatusBadge variant="neutral">Derived from record</StatusBadge>
                      )}
                    </span>
                    <ChangeDiff event={e} />
                    {e.reason && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Reason: {e.reason}
                      </span>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )}

        {data?.has_more && (
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
            disabled={isFetching}
            className={`${chipBtn} mt-2 w-full disabled:opacity-50`}
          >
            {isFetching ? "Loading..." : `Load ${PAGE_SIZE} more`}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        This history is append-only. Entries cannot be edited or deleted.
      </p>
    </div>
  );
}
