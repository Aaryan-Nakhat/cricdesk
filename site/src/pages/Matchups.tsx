import { useMemo } from "react";
import { Crosshair, Zap, Disc } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAsync } from "@/lib/useAsync";
import { getMatchups, type Matchups as MatchupsData } from "@/lib/data";
import { usePlayers } from "@/lib/usePlayers";
import { Combobox } from "@/components/Combobox";
import { DataTable, type Col } from "@/components/DataTable";
import { PageTitle, Card, CardHeader, Spinner, Empty, StatTile, Badge, ErrorBox, InfoTip } from "@/components/ui";
import { fmt } from "@/lib/utils";
import { useUrlId, useUrlNumber } from "@/lib/useUrlState";

type Row = Record<string, unknown>;

const BAT_COLS: Col<Row>[] = [
  { key: "bowler", label: "Bowler", primary: false },
  { key: "balls", label: "Balls", align: "right", digits: 0 },
  { key: "runs", label: "Runs", align: "right", digits: 0 },
  { key: "sr", label: "Strike rate", align: "right", digits: 1, primary: true,
    info: <InfoTip title="Strike rate">His runs per 100 balls against this bowler: 150 means 15 runs every 10 balls.</InfoTip> },
  { key: "dot_pct", label: "Dot %", align: "right", digits: 1,
    info: <InfoTip title="Dot %">The share of these balls he scored nothing off the bat.</InfoTip> },
  { key: "outs", label: "Times out", align: "right", digits: 0,
    info: <InfoTip title="Times out">How often this bowler got him out (run outs are not the bowler’s, so they don’t count).</InfoTip> },
];
const BOWL_COLS: Col<Row>[] = [
  { key: "batter", label: "Batter", primary: false },
  { key: "balls", label: "Balls", align: "right", digits: 0 },
  { key: "runs", label: "Runs", align: "right", digits: 0 },
  { key: "sr", label: "Strike rate conceded", align: "right", digits: 1, primary: true,
    info: <InfoTip title="Strike rate conceded">The batter's runs per 100 balls against him: lower is better for the bowler.</InfoTip> },
  { key: "dot_pct", label: "Dot %", align: "right", digits: 1,
    info: <InfoTip title="Dot %">The share of these balls the batter scored nothing off the bat.</InfoTip> },
  { key: "outs", label: "Wickets", align: "right", digits: 0,
    info: <InfoTip title="Wickets">How often he got this batter out.</InfoTip> },
];

/** The opponent column shows the fan name (rows carry the scorecard name and the registry id). */
function withNames(cols: Col<Row>[], key: string, nameOf: (n: string, cid?: unknown) => string): Col<Row>[] {
  return cols.map((c) =>
    c.key === key
      ? { ...c, render: (r: Row) => <span className="text-fg">{nameOf(String(r[key] ?? ""), r[`${key}_id`])}</span> }
      : c,
  );
}

/** "once every 26 balls" — a dismissal rate a fan can picture. */
function outEvery(side: { balls: number; outs: number }): string {
  if (!side.outs) return "never out";
  return `once every ${Math.round(side.balls / side.outs)} balls`;
}

function Splits({ splits }: { splits: MatchupsData["splits"] }) {
  if (!splits || (!splits.vs_seam && !splits.vs_spin)) return null;
  const seam = splits.vs_seam;
  const spin = splits.vs_spin;
  // Lower SR side = the weaker matchup for this batter.
  const weaker =
    seam && spin ? (seam.sr < spin.sr ? "pace" : spin.sr < seam.sr ? "spin" : null) : null;
  return (
    <Card>
      <CardHeader
        title="Pace vs spin"
        subtitle="How this batter scores and survives against pace (seam) and spin, over his career"
        right={
          weaker && (
            <Badge tone="ball">
              weaker vs {weaker}
            </Badge>
          )
        }
      />
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {seam && (
          <>
            <StatTile label="Strike rate v pace" value={fmt(seam.sr, 1)} hint={`${seam.balls} balls`} />
            <StatTile
              label="Out to pace"
              value={outEvery(seam)}
              hint={`${seam.outs} dismissals · out on ${fmt(seam.out_rate, 2)}% of balls faced`}
            />
          </>
        )}
        {spin && (
          <>
            <StatTile label="Strike rate v spin" value={fmt(spin.sr, 1)} hint={`${spin.balls} balls`} />
            <StatTile
              label="Out to spin"
              value={outEvery(spin)}
              hint={`${spin.outs} dismissals · out on ${fmt(spin.out_rate, 2)}% of balls faced`}
            />
          </>
        )}
      </div>
    </Card>
  );
}

export function Matchups() {
  const { collection } = useStore();
  const { options, players, byId, nameOf, loading: playersLoading } = usePlayers(collection);
  const batCols = useMemo(() => withNames(BAT_COLS, "bowler", nameOf), [nameOf]);
  const bowlCols = useMemo(() => withNames(BOWL_COLS, "batter", nameOf), [nameOf]);
  // player + min-balls live in the URL (`?player=…&minballs=…`) so a link reproduces the view
  const [cid, setCid] = useUrlId("player", byId, players.length > 0);
  const [minBalls, setMinBalls] = useUrlNumber("minballs", 6, { min: 1 });
  const { data, loading, error } = useAsync<MatchupsData | null>(
    () => (cid ? getMatchups(collection, cid) : Promise.resolve(null)),
    [collection, cid],
  );

  const asBatter = useMemo(
    () => (data?.as_batter ?? []).filter((r) => r.balls >= minBalls),
    [data, minBalls],
  );
  const asBowler = useMemo(
    () => (data?.as_bowler ?? []).filter((r) => r.balls >= minBalls),
    [data, minBalls],
  );

  return (
    <>
      <PageTitle
        title="Matchups"
        icon={<Crosshair className="h-6 w-6" />}
        desc="Pick a player to see their toughest and favourite head-to-heads — ball-by-ball as a batter and as a bowler — plus how a batter fares against pace versus spin."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Combobox
          options={options}
          value={cid}
          onChange={setCid}
          placeholder={playersLoading ? "Loading players…" : "Search a player…"}
          className="max-w-md flex-1"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <span>Min balls</span>
          <InfoTip title="Min balls">Hides head-to-heads with fewer balls than this: a handful of balls says little.</InfoTip>
          <input
            type="number"
            min={1}
            value={minBalls}
            onChange={(e) => setMinBalls(Math.max(1, Number(e.target.value) || 1))}
            className="input w-20 py-1.5"
          />
        </label>
      </div>

      {!cid ? (
        <Empty>Pick a player to see their matchups.</Empty>
      ) : loading && !data ? (
        <Spinner label="Loading matchups…" />
      ) : error && !error.startsWith("Not available") ? (
        <ErrorBox message={error} />
      ) : !data ? (
        <Empty>No matchup data for this player (needs enough balls faced/bowled).</Empty>
      ) : (
        <div className="space-y-5 animate-fade-up">
          <Splits splits={data.splits} />

          {asBatter.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                <Zap className="h-4 w-4 text-accent" /> As a batter — opponents faced
              </div>
              <DataTable
                rows={asBatter as unknown as Row[]}
                cols={batCols}
                initialSort={{ key: "balls", dir: "desc" }}
              />
            </div>
          )}

          {asBowler.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                <Disc className="h-4 w-4 text-ball" /> As a bowler — batters faced
              </div>
              <DataTable
                rows={asBowler as unknown as Row[]}
                cols={bowlCols}
                initialSort={{ key: "balls", dir: "desc" }}
              />
            </div>
          )}

          {asBatter.length === 0 && asBowler.length === 0 && (
            <Empty>No head-to-heads at ≥ {minBalls} balls — lower the min.</Empty>
          )}
        </div>
      )}
    </>
  );
}
