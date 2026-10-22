"use client";

import { useId } from "react";
import { InlineScript } from "./InlineScript";

const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" };

/** Formats a timestamp in the viewer's locale/time zone without a hydration flash. */
export function LocalDate({ date }: { date: string }) {
  const id = useId();
  return (
    <>
      <time id={id} dateTime={date} suppressHydrationWarning>
        {new Date(date).toLocaleString(undefined, options)}
      </time>
      <InlineScript
        html={`{var n=document.getElementById(${JSON.stringify(id)});if(n)n.textContent=new Date(${JSON.stringify(date)}).toLocaleString(undefined,${JSON.stringify(options)})}`}
      />
    </>
  );
}
