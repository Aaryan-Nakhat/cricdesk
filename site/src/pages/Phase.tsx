import { useMemo } from "react";
import { Timer } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePlayers } from "@/lib/usePlayers";
import { useAsync } from "@/lib/useAsync";
import { getPhase } from "@/lib/data";
import { DataTable, type Col } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { applyFilters, smartFilters, defaultFiltersFor, type Dim } from "@/lib/filters";
import { useUrlFilters, useUrlState } from "@/lib/useUrlState";
import { PageTitle, Spinner, ErrorBox, Empty, InfoTip } from "@/components/ui";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;
type PhaseKey = "powerplay" | "middle" | "death";

const PHASES: { key: PhaseKey; label: string; overs: string }[] = [
  { key: "powerplay", label: "Powerplay", overs: "overs 1–6" },
  { key: "middle", label: "Middle", overs: "overs 7–16" },
  { key: "death", label: "Death", overs: "overs 17–20" },
];

const BAT_COLS: Col<Row>[] = [
  { key: "name", label: "Batter", primary: false },
  { key: "runs", label: "Runs", align: "right", digits: 0 },
  { key: "balls", label: "Balls", align: "right", digits: 0,
    info: <InfoTip title="Balls">Legal balls he faced in this phase (wides don't count). At least 90 to be listed.</InfoTip> },
  { key: "sr", label: "Strike rate", align: "right", digits: 1, primary: true,
    info: <InfoTip title="Strike rate">Runs per 100 balls faced in this phase: 150 means 15 runs every 10 balls.</InfoTip> },
];
const BOWL_COLS: Col<Row>[] = [
  { key: "name", label: "Bowler", primary: false },
  { key: "wickets", label: "Wickets", align: "right", digits: 0,
    info: <InfoTip title="Wickets">Wickets he took in this phase (run outs don't count to the bowler).</InfoTip> },
  { key: "balls", label: "Balls", align: "right", digits: 0,
    info: <InfoTip title="Balls">Legal balls he bowled in this phase (wides and no-balls don't count). At least 90 to be listed.</InfoTip> },
  { key: "runs", label: "Runs", align: "right", digits: 0,
    info: <InfoTip title="Runs">Runs he conceded in this phase, wides and no-balls included (byes and leg-byes are not his).</InfoTip> },
  { key: "econ", label: "Economy", align: "right", digits: 2, primary: true,
    info: <InfoTip title="Economy">Runs conceded per over (6 legal balls) in this phase: lower is better.</InfoTip> },
];
const TOP = 25;
const PHASE_DIMS: Dim[] = ["minMatches", "activity", "role", "bowling", "position", "country"];

export function Phase() {
  const { collection } = useStore();
  const { data, loading, error } = useAsync(() => getPhase(collection), [collection]);
  const { nameOf } = usePlayers(collection);
  const named = (cols: Col<Row>[]) =>
    cols.map((c) => (c.key === "name" ? { ...c, render: (r: Row) => <span className="text-fg">{nameOf(String(r.name ?? ""), r.cricsheet_id)}</span> } : c));
  const [phase, setPhase] = useUrlState<PhaseKey>("phase", "powerplay", {
    valid: PHASES.map((p) => p.key),
    replace: false,
  });
  const board = data?.[phase];
  const rawBatters = (board?.batters ?? []) as unknown as Row[];
  const rawBowlers = (board?.bowlers ?? []) as unknown as Row[];
  // same defaults as the other boards — keeps tiny samples from long-retired players off the top
  const defaults = useMemo(() => defaultFiltersFor([...rawBatters, ...rawBowlers]), [rawBatters, rawBowlers]);
  const [filters, setFilters] = useUrlFilters(defaults);

  // options come from the rows actually on this phase's boards; dead ends are hidden / disabled
  const smart = useMemo(
    () => smartFilters([...rawBatters, ...rawBowlers], filters, PHASE_DIMS),
    [rawBatters, rawBowlers, filters],
  );
  const batters = useMemo(
    () => applyFilters(rawBatters, smart.effective).slice(0, TOP),
    [rawBatters, smart.effective],
  );
  const bowlers = useMemo(
    () => applyFilters(rawBowlers, smart.effective).slice(0, TOP),
    [rawBowlers, smart.effective],
  );

  return (
    <>
      <PageTitle
        title="Phase specialists"
        icon={<Timer className="h-6 w-6" />}
        desc="Who actually dominates each phase of the innings — best strike rates with the bat and tightest economies with the ball across the powerplay, middle overs and death."
      />
      <p className="-mt-2 mb-4 flex items-center gap-1.5 text-sm text-muted">
        Every match in this league, all seasons; at least 90 balls in the phase to be listed.
        <InfoTip title="The three phases">
          A T20 innings in three parts: the powerplay (overs 1–6, only two fielders allowed outside the circle), the
          middle overs (7–16) and the death (overs 17–20). Super overs are left out.
        </InfoTip>
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {PHASES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPhase(p.key)}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm transition-colors",
              phase === p.key
                ? "border-accent/50 bg-accent/10 text-accent-glow"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            <span className="font-semibold">{p.label}</span>
            <span className="ml-1.5 text-xs text-muted">{p.overs}</span>
          </button>
        ))}
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        defaults={defaults}
        smart={smart}
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} />
      ) : !board ? (
        <Empty>No phase data for this collection.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 animate-fade-up 2xl:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-fg">Best strike rates</div>
            {batters.length ? (
              <DataTable rows={batters} cols={named(BAT_COLS)} initialSort={{ key: "sr", dir: "desc" }} />
            ) : (
              <Empty>No batters match these filters.</Empty>
            )}
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-fg">Tightest economies</div>
            {bowlers.length ? (
              <DataTable rows={bowlers} cols={named(BOWL_COLS)} initialSort={{ key: "econ", dir: "asc" }} />
            ) : (
              <Empty>No bowlers match these filters.</Empty>
            )}
          </div>
        </div>
      )}
    </>
  );
}
