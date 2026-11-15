"use client";

import * as React from "react";
import { Box, CalendarDays, Grid2X2, RotateCcw, Timer } from "lucide-react";
import { Select } from "../UI";

export interface FocusSession {
  id: string;
  title: string;
  minutes: number;
  /** Optional local time, for example "09:00". */
  startedAt?: string;
}

export interface FocusDay {
  /** ISO calendar date: YYYY-MM-DD. */
  date: string;
  sessions: FocusSession[];
}

export interface FocusCityProps {
  days: FocusDay[];
  /** Last visible calendar date. Defaults to the latest supplied date. */
  endDate?: string;
  title?: string;
  description?: string;
  defaultView?: "city" | "heatmap";
  defaultWeeks?: 4 | 12;
  theme?: "auto" | "light" | "dark";
  className?: string;
  style?: React.CSSProperties;
  onDaySelect?: (day: FocusDay) => void;
  totalReviews?: number | string;
  totalContent?: number | string;
}

type Point = [number, number];
type Block = { day: FocusDay; minutes: number; column: number; row: number; future: boolean };
const DAY_MS = 86_400_000;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const parse = (date: string) => new Date(`${date}T00:00:00.000Z`);
const shift = (date: string, days: number) => iso(new Date(parse(date).getTime() + days * DAY_MS));
const minutesOf = (day: FocusDay) => day.sessions.reduce((sum, session) => sum + Math.max(0, Number.isFinite(session.minutes) ? session.minutes : 0), 0);
const duration = (minutes: number) => {
  const rounded = Math.round(minutes);
  return rounded >= 60 ? `${Math.floor(rounded / 60)}h${rounded % 60 ? ` ${rounded % 60}m` : ""}` : `${rounded}m`;
};
const dateLabel = (date: string, long = false) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", ...(long ? { year: "numeric" } : {}), timeZone: "UTC" }).format(parse(date));
const shortDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(parse(date));
const level = (minutes: number) => minutes === 0 ? 0 : minutes < 60 ? 1 : minutes < 120 ? 2 : minutes < 180 ? 3 : 4;
const points = (vertices: Point[]) => vertices.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
const lerpPoints = (flat: Point[], city: Point[], progress: number): Point[] => flat.map(([x, y], index) => [x + (city[index][0] - x) * progress, y + (city[index][1] - y) * progress]);

function calendar(days: FocusDay[], endDate: string, weeks: number): Block[] {
  const endDay = (parse(endDate).getUTCDay() + 6) % 7;
  const first = shift(endDate, -endDay - (weeks - 1) * 7);
  const map = new Map(days.map(day => [day.date, day]));
  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = shift(first, index);
    const day = map.get(date) ?? { date, sessions: [] };
    return { day, minutes: minutesOf(day), column: Math.floor(index / 7), row: index % 7, future: date > endDate };
  });
}

function geometry(blocks: Block[], width: number, height: number, yaw: number) {
  const columns = blocks.length / 7;
  const project = (x: number, y: number, z = 0): Point => [x * Math.cos(yaw) - y * Math.sin(yaw), (x * Math.sin(yaw) + y * Math.cos(yaw)) * .46 - z];
  const raw = blocks.map(block => {
    const x = block.column, y = block.row, size = .79;
    const z = block.future ? 0 : block.minutes / 60 * .34;
    return { base: [project(x, y), project(x + size, y), project(x + size, y + size), project(x, y + size)], roof: [project(x, y, z), project(x + size, y, z), project(x + size, y + size, z), project(x, y + size, z)] };
  });
  const ground = [project(-.32, -.32), project(columns - .05, -.32), project(columns - .05, 6.99), project(-.32, 6.99)];
  const vertices = [...ground, ...raw.flatMap(item => [...item.base, ...item.roof])];
  const minX = Math.min(...vertices.map(point => point[0])), maxX = Math.max(...vertices.map(point => point[0]));
  const minY = Math.min(...vertices.map(point => point[1])), maxY = Math.max(...vertices.map(point => point[1]));
  const scale = Math.min((width - 36) / (maxX - minX), (height - 40) / (maxY - minY));
  const offsetX = (width - (maxX - minX) * scale) / 2, offsetY = (height - (maxY - minY) * scale) / 2 - 3;
  const fit = ([x, y]: Point): Point => [(x - minX) * scale + offsetX, (y - minY) * scale + offsetY];
  const cell = Math.min(27, (width - 64) / columns, (height - 60) / 7), gap = Math.max(3, cell * .16);
  const flatX = (width - columns * cell) / 2 + 12, flatY = (height - 7 * cell) / 2 - 2;
  return {
    ground: ground.map(fit),
    flatX, flatY, cell,
    blocks: raw.map((item, index) => {
      const block = blocks[index], x = flatX + block.column * cell, y = flatY + block.row * cell;
      const flat: Point[] = [[x, y], [x + cell - gap, y], [x + cell - gap, y + cell - gap], [x, y + cell - gap]];
      return { ...block, flat, base: item.base.map(fit), roof: item.roof.map(fit), depth: block.column * Math.sin(yaw) + block.row * Math.cos(yaw) };
    }).sort((a, b) => a.depth - b.depth),
  };
}

function useMorph(view: "city" | "heatmap") {
  const [progress, setProgress] = React.useState(view === "city" ? 1 : 0);
  const current = React.useRef(progress);
  React.useEffect(() => {
    const target = view === "city" ? 1 : 0;
    if (current.current === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = target; setProgress(target); return;
    }
    const from = current.current, start = performance.now();
    let frame = 0;
    const step = (time: number) => {
      const elapsed = Math.min(1, (time - start) / 380), eased = 1 - Math.pow(1 - elapsed, 3);
      current.current = from + (target - from) * eased;
      setProgress(current.current);
      if (elapsed < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [view]);
  return progress;
}

/** An SVG focus calendar with a real, data-driven isometric view. No canvas or network access. */
export function FocusCity({ days, endDate, title = "Focus City", description = "A little focus. A growing skyline.", defaultView = "city", defaultWeeks, theme = "auto", className = "", style, onDaySelect, totalReviews, totalContent }: FocusCityProps) {
  const today = iso(new Date());
  const validDays = React.useMemo(() => days.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && !Number.isNaN(parse(day.date).getTime())), [days]);
  const lastDate = endDate ?? validDays.map(day => day.date).sort().at(-1) ?? today;
  const [view, setView] = React.useState(defaultView);
  const [weeks, setWeeks] = React.useState<4 | 12>(defaultWeeks ?? 12);
  const [manualRange, setManualRange] = React.useState(false);
  const [selected, setSelected] = React.useState(lastDate);
  const [width, setWidth] = React.useState(640);
  const [yaw, setYaw] = React.useState(Math.PI / 6);
  const [hover, setHover] = React.useState<{ date: string; x: number; y: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const plotRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ start: number; yaw: number; moved: boolean; pointer: number } | null>(null);
  const skipClick = React.useRef(false);
  const id = React.useId();
  const progress = useMorph(view);


  React.useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const measure = () => {
      const nextWidth = Math.max(240, element.getBoundingClientRect().width);
      setWidth(nextWidth);
      if (defaultWeeks === undefined && !manualRange) setWeeks(nextWidth < 480 ? 4 : 12);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [defaultWeeks, manualRange]);

  const blocks = React.useMemo(() => calendar(validDays, lastDate, weeks), [validDays, lastDate, weeks]);
  const available = React.useMemo(() => blocks.filter(block => !block.future), [blocks]);
  const active = available.find(block => block.day.date === selected) ?? available.at(-1)!;
  const activeIndex = available.findIndex(block => block.day.date === active.day.date);
  const hovered = blocks.find(block => block.day.date === hover?.date);
  const total = available.reduce((sum, block) => sum + block.minutes, 0);
  const totalSessionsCount = available.reduce((sum, block) => sum + block.day.sessions.length, 0);
  const totalReviewsCount = totalReviews ?? totalSessionsCount;
  const totalContentCount = totalContent ?? Math.round(Number(totalReviewsCount) * 1.5);
  let streak = 0, bestStreak = 0;
  for (const block of available) { streak = block.minutes > 0 ? streak + 1 : 0; bestStreak = Math.max(streak, bestStreak); }
  const height = width < 480 ? 240 : 264;
  const layout = React.useMemo(() => geometry(blocks, width, height, yaw), [blocks, width, height, yaw]);
  const selectDay = (day: FocusDay) => { setSelected(day.date); setHover(null); onDaySelect?.(day); };
  const moveDay = (offset: number) => { const next = available[activeIndex + offset]; if (next) selectDay(next.day); };
  const cameraChanged = Math.abs(yaw - Math.PI / 6) > .005;
  const pointerPosition = (event: React.PointerEvent) => {
    const rect = plotRef.current!.getBoundingClientRect();
    return { x: Math.max(8, Math.min(width - 168, event.clientX - rect.left + 12)), y: Math.max(4, Math.min(height - 68, event.clientY - rect.top - 56)) };
  };

  return (
    <section className={`focus-city ${className}`} data-theme={theme} style={style} aria-label={title}>
      <style>{styles}</style>
      <header className="fc-header">
        <div className="fc-heading"><span className="fc-emblem"><Timer size={17} strokeWidth={1.7} aria-hidden="true" /></span><div><h2>{title}</h2><p>{description}</p></div></div>
        <div className="fc-tools">
          <Select
            className="fc-range-select"
            value={weeks}
            onChange={(val: any) => {
              setWeeks(Number(val) as 4 | 12);
              setManualRange(true);
              setHover(null);
            }}
            options={[
              { value: 4, label: "4 weeks" },
              { value: 12, label: "12 weeks" },
            ]}
            ariaLabel="Visible period"
          />
          <div className="fc-switch" role="group" aria-label="Visualization view">
            <button type="button" className="cursor-interaction" aria-pressed={view === "city"} onClick={() => { setView("city"); setHover(null); }}><Box size={14} aria-hidden="true" /><span>3D</span></button>
            <button type="button" className="cursor-interaction" aria-pressed={view === "heatmap"} onClick={() => { setView("heatmap"); setHover(null); }}><Grid2X2 size={14} aria-hidden="true" /><span>2D</span></button>
          </div>
        </div>
      </header>
      <div className="fc-stats">
        <div><span>Total reviews</span><strong>{totalReviewsCount}</strong><small>across {weeks} weeks</small></div>
        <div><span>Total content made</span><strong>{totalContentCount}</strong><small>pieces submitted</small></div>
        <div><span>Best streak</span><strong>{bestStreak}<em> days</em></strong><small>consecutive review days</small></div>
      </div>
      <div className="fc-plot-header"><span><CalendarDays size={12} aria-hidden="true" />{shortDate(available[0].day.date)} — {shortDate(lastDate)}</span><span>{view === "city" ? "Drag to orbit" : "Select a day"}{cameraChanged && view === "city" && <button className="fc-camera cursor-interaction" type="button" aria-label="Reset city angle" onClick={() => setYaw(Math.PI / 6)}><RotateCcw size={12} aria-hidden="true" /></button>}</span></div>
      <div ref={plotRef} className={`fc-plot ${dragging ? "fc-dragging" : ""}`} data-view={view}>
        <svg className="fc-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}
          onPointerDown={event => {
            if (view !== "city" || event.button !== 0) return;
            drag.current = { start: event.clientX, yaw, moved: false, pointer: event.pointerId };
            skipClick.current = false;
          }}
          onPointerMove={event => {
            if (!drag.current) return;
            const delta = event.clientX - drag.current.start;
            if (Math.abs(delta) > 5 && !drag.current.moved) {
              drag.current.moved = true; setDragging(true); setHover(null);
              event.currentTarget.setPointerCapture(event.pointerId);
            }
            if (drag.current.moved) setYaw(Math.max(.24, Math.min(.81, drag.current.yaw + delta / 540)));
          }}
          onPointerUp={() => { skipClick.current = Boolean(drag.current?.moved); drag.current = null; setDragging(false); }}
          onPointerCancel={() => { drag.current = null; skipClick.current = true; setDragging(false); }}
          onPointerLeave={() => { setHover(null); if (!drag.current?.moved) drag.current = null; }}
          onDoubleClick={() => setYaw(Math.PI / 6)}>
          <title id={`${id}-chart-title`}>{view === "city" ? "Isometric focus city" : "Daily focus heatmap"}</title>
          <desc id={`${id}-chart-desc`}>{available.length} days from {shortDate(available[0].day.date)} to {shortDate(lastDate)}. {duration(total)} total focus. One block per day. Height and green intensity represent focus minutes. Use the day navigation buttons or date picker below to inspect every day with a keyboard.</desc>
          <polygon points={points(layout.ground)} fill="var(--fc-ground)" opacity={progress} />
          {layout.blocks.map(block => {
            const roof = lerpPoints(block.flat, block.roof, progress), base = lerpPoints(block.flat, block.base, progress);
            const isSelected = block.day.date === active.day.date;
            const isHovered = block.day.date === hover?.date;
            return <g key={block.day.date} data-date={block.day.date} data-level={level(block.minutes)} className={`fc-block cursor-interaction ${isSelected ? "fc-selected" : ""} ${isHovered ? "fc-hovered" : ""}`} opacity={block.future ? .2 : 1}
              onClick={() => { if (!block.future && !skipClick.current) selectDay(block.day); skipClick.current = false; }}
              onPointerEnter={event => { if (!block.future && !drag.current?.moved && event.pointerType !== "touch") setHover({ date: block.day.date, ...pointerPosition(event) }); }}
              onPointerMove={event => { if (!block.future && !drag.current?.moved && event.pointerType !== "touch") setHover({ date: block.day.date, ...pointerPosition(event) }); }}>
              <polygon className="fc-face fc-left" points={points([roof[3], roof[2], base[2], base[3]])} />
              <polygon className="fc-face fc-right" points={points([roof[1], roof[2], base[2], base[1]])} />
              <polygon className="fc-face fc-roof" points={points(roof)} />
              {isSelected && <polygon className="fc-selection" points={points(roof)} fill="none" stroke="var(--fc-ink)" strokeWidth="1.5" strokeLinejoin="round" />}
            </g>;
          })}
          <g className="fc-axis" opacity={1 - progress} aria-hidden="true">
            {[[0, "Mon"], [2, "Wed"], [4, "Fri"]].map(([row, label]) => <text key={label} x={layout.flatX - 10} y={layout.flatY + Number(row) * layout.cell + layout.cell * .56} textAnchor="end">{label}</text>)}
            {Array.from({ length: weeks }, (_, column) => column % (weeks === 12 ? 4 : 2) === 0 && <text key={column} x={layout.flatX + column * layout.cell} y={layout.flatY - 11}>{shortDate(blocks[column * 7].day.date)}</text>)}
          </g>
        </svg>
        {hover && hovered && <div className="fc-tooltip" style={{ left: hover.x, top: hover.y }} role="tooltip"><span>{dateLabel(hover.date)}</span><strong>{duration(hovered.minutes)} <small>focused</small></strong></div>}
      </div>
      <div className="fc-legend"><span>{view === "city" ? "One day. One building." : "One day. One square."}</span><div><span>0</span>{[0, 1, 2, 3, 4].map(value => <i key={value} data-level={value} aria-hidden="true" />)}<span>3h+</span></div></div>
    </section>
  );
}

export default FocusCity;

const styles = `
.focus-city{--fc-surface:var(--paper-raised,light-dark(#fff,#111));--fc-ink:var(--ink,light-dark(#171717,#ededed));--fc-muted:var(--muted,light-dark(#686868,#aaa));--fc-border:var(--line,light-dark(#e8e8e8,#2a2a2a));--fc-hover:var(--cream-deep,light-dark(#f5f5f5,#242424));--fc-subtle:var(--cream,light-dark(#fafafa,#181818));--fc-selected:var(--ink,light-dark(#171717,#ededed));--fc-on-selected:var(--paper-raised,light-dark(#fff,#151515));--fc-ground:var(--cream,light-dark(#f3f5f4,#191e1b));--fc-empty:var(--line,light-dark(#e5eae7,#26332c));--fc-green-1:var(--fc-lvl-1,light-dark(#d7eafb,#1a4163));--fc-green-2:var(--fc-lvl-2,light-dark(#8ec5f3,#205e94));--fc-green-3:var(--fc-lvl-3,light-dark(#4ba3ee,#247bc4));--fc-green-4:var(--fc-lvl-4,light-dark(#298ee4,#298ee4));--fc-shadow:light-dark(rgba(59,36,24,0.06),#00000030);color:var(--fc-ink);background:var(--fc-surface);border:1px solid var(--fc-border);border-radius:14px;box-shadow:0 3px 16px var(--fc-shadow);width:100%;max-width:720px;margin-inline:auto;overflow:hidden;font-family:inherit;font-size:13px;line-height:1.5;text-align:left;box-sizing:border-box;isolation:isolate}
.focus-city[data-theme=light]{color-scheme:light}.focus-city[data-theme=dark]{color-scheme:dark}.dark .focus-city[data-theme=auto]{color-scheme:dark}
.focus-city *,.focus-city *::before,.focus-city *::after{box-sizing:border-box}.focus-city button,.focus-city select,.focus-city input{font:inherit;color:inherit}.focus-city button{transition:background .16s ease,color .16s ease,transform .16s ease}.focus-city button:active:not(:disabled){transform:translateY(1px)}.focus-city button:disabled{opacity:.3;cursor:default}.focus-city svg:not(.fc-chart){flex:none}.fc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.fc-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px 16px}.fc-heading{display:flex;gap:11px;align-items:center;min-width:0}.fc-emblem{width:34px;height:34px;border:1px solid var(--fc-border);border-radius:9px;display:grid;place-items:center;background:var(--fc-subtle);flex:none}.fc-heading h2{font-size:15px;font-weight:600;letter-spacing:-.3px;line-height:1.3;margin:0}.fc-heading p{font-size:12px;line-height:1.4;color:var(--fc-muted);margin:4px 0 0}.fc-tools{display:flex;align-items:center;gap:8px;flex:none}
.fc-range-select .custom-select__trigger{height:30px;padding:0 10px;background:var(--fc-surface);border:1px solid var(--fc-border);border-radius:7px;font-size:12px;font-weight:600;color:var(--fc-ink);min-width:105px}.fc-range-select .custom-select__trigger:hover{background:var(--fc-hover);border-color:var(--line-strong,var(--fc-border))}.fc-range-select .custom-select__dropdown{background:var(--fc-surface);border-color:var(--fc-border);border-radius:9px;min-width:115px;z-index:40}.fc-range-select .custom-select__option{font-size:12px;color:var(--fc-ink)}.fc-range-select .custom-select__option:hover{background:var(--fc-hover);color:var(--fc-ink)}.fc-range-select .custom-select__option.is-selected{background:var(--sage-soft,#d7eafb);color:var(--sage-deep,#166cb8);font-weight:700}
.fc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 24px 16px;padding-bottom:14px;border-bottom:1px solid var(--fc-border)}.fc-stats>div{display:flex;flex-direction:column}.fc-stats>div+div{padding-left:18px;border-left:1px solid var(--fc-border)}.fc-stats span{color:var(--fc-muted);font-size:11px;font-weight:600}.fc-stats strong{display:block;font-size:22px;line-height:1.25;font-weight:700;letter-spacing:-.6px;margin:3px 0 2px;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--fc-ink)}.fc-stats em{font-size:13px;font-weight:500;font-style:normal;letter-spacing:-.2px;color:var(--fc-muted)}.fc-stats small{font-size:11px;color:var(--fc-muted)}
.fc-switch{display:flex;padding:3px;background:var(--fc-subtle);border:1px solid var(--fc-border);border-radius:8px;gap:2px}.fc-switch button{display:flex;align-items:center;justify-content:center;gap:5px;border:0;background:transparent;border-radius:5px;height:25px;padding:0 8px;font-size:12px;color:var(--fc-muted)}.fc-switch button:hover{background:var(--fc-hover);color:var(--fc-ink)}.fc-switch button[aria-pressed=true]{background:var(--fc-selected);color:var(--fc-on-selected);box-shadow:0 1px 2px var(--fc-shadow)}.fc-switch button[aria-pressed=true]:hover{background:var(--fc-selected);color:var(--fc-on-selected)}
.fc-plot-header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 24px;color:var(--fc-muted);font-size:11px;min-height:23px}.fc-plot-header>span{display:flex;align-items:center;gap:6px}.fc-camera{height:24px;width:24px;border:0;background:transparent;display:grid;place-items:center;border-radius:5px;padding:0}.fc-camera:hover{background:var(--fc-hover)}.fc-plot{position:relative;margin:0 10px;touch-action:pan-y}.fc-chart{display:block;overflow:visible;user-select:none}.fc-plot[data-view=city] .fc-chart{cursor:grab}.fc-dragging .fc-chart{cursor:grabbing!important}.fc-block{--fc-top:var(--fc-empty)}.fc-block[data-level="1"]{--fc-top:var(--fc-green-1)}.fc-block[data-level="2"]{--fc-top:var(--fc-green-2)}.fc-block[data-level="3"]{--fc-top:var(--fc-green-3)}.fc-block[data-level="4"]{--fc-top:var(--fc-green-4)}.fc-roof{fill:var(--fc-top)}.fc-left{fill:color-mix(in srgb,var(--fc-top) 87%,var(--fc-ink) 13%)}.fc-right{fill:color-mix(in srgb,var(--fc-top) 72%,var(--fc-ink) 28%)}.fc-face{transition:filter .14s ease}.fc-hovered .fc-face{filter:brightness(1.08)}.fc-axis text{fill:var(--fc-muted);font-size:11px;font-family:inherit}.fc-tooltip{position:absolute;min-width:150px;z-index:3;pointer-events:none;border:1px solid var(--fc-border);border-radius:8px;padding:8px 10px;box-shadow:0 4px 16px var(--fc-shadow);background:var(--fc-surface);display:flex;flex-direction:column;gap:2px;font-size:11px}.fc-tooltip>span{color:var(--fc-muted)}.fc-tooltip>strong{font-size:13px;font-weight:500}.fc-tooltip small{font-size:11px;color:var(--fc-muted);font-weight:400}
.fc-legend{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 24px 18px;font-size:11px;color:var(--fc-muted)}.fc-legend>div{display:flex;align-items:center;gap:4px}.fc-legend i{width:10px;height:10px;border-radius:2px;background:var(--fc-empty)}.fc-legend i[data-level="1"]{background:var(--fc-green-1)}.fc-legend i[data-level="2"]{background:var(--fc-green-2)}.fc-legend i[data-level="3"]{background:var(--fc-green-3)}.fc-legend i[data-level="4"]{background:var(--fc-green-4)}.fc-legend>div>span:first-child{margin-right:3px}.fc-legend>div>span:last-child{margin-left:3px}
@media(max-width:560px){.fc-header{align-items:flex-start;flex-wrap:wrap;gap:14px;padding:19px 18px 0}.fc-tools{width:100%;justify-content:space-between}.fc-plot-header{margin:0 18px}.fc-legend{margin:0 18px 16px}.fc-stats{margin:16px 18px 14px;gap:8px}.fc-stats>div+div{padding-left:12px}.fc-stats strong{font-size:19px}.fc-stats em{font-size:11px}}
@media(pointer:coarse){.fc-switch button{height:38px;min-width:44px}.fc-range-select .custom-select__trigger{height:38px;font-size:14px}.fc-camera{height:44px;width:44px}.fc-plot-header{min-height:32px}}
.fc-switch button{font-family:inherit}
@media(prefers-reduced-motion:reduce){.focus-city *,.focus-city *::before,.focus-city *::after{animation:none!important;transition:none!important}}
`;