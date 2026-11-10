import type { ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";
import { InfoTip } from "./ui";

/**
 * A term with its explanation one click away: the text (if any) then a small (i) button.
 * `k` names a shared glossary entry; `tip` (with `title`) explains a page-only term.
 * Use it in table headers, badges and sub-lines wherever a visitor could meet the word cold.
 */
export function Term({
  k,
  title,
  tip,
  children,
  className,
}: {
  k?: GlossaryKey;
  title?: string;
  tip?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const entry = k ? GLOSSARY[k] : undefined;
  const head = title ?? entry?.title;
  const body = tip ?? entry?.text;
  if (!body) return <>{children}</>;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {children}
      <InfoTip title={head} label={head ? `What "${head}" means` : undefined}>
        {body}
      </InfoTip>
    </span>
  );
}
