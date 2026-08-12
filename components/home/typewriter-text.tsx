"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TypewriterText({
  text,
  className,
  ...rest
}: { text: string; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const [display, setDisplay] = React.useState("");
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (matches: boolean) => {
      setReduced(matches);
      if (matches) setDisplay(text);
    };
    apply(media.matches);
    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [text]);

  React.useEffect(() => {
    if (reduced) return;

    let index = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!deleting) {
        index += 1;
        setDisplay(text.slice(0, index));
        if (index >= text.length) {
          deleting = true;
          timer = setTimeout(tick, 2200);
        } else {
          timer = setTimeout(tick, 70 + Math.random() * 50);
        }
      } else {
        index -= 1;
        setDisplay(text.slice(0, index));
        if (index <= 0) {
          deleting = false;
          timer = setTimeout(tick, 600);
        } else {
          timer = setTimeout(tick, 35 + Math.random() * 30);
        }
      }
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [text, reduced]);

  const words = display.split(" ");
  const lastWord = words[words.length - 1] ?? "";
  const prefix = words.slice(0, -1).join(" ");

  return (
    <span className={className} {...rest}>
      {prefix.length > 0 && <>{prefix} </>}
      {lastWord.length > 0 && (
        <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_0_1px_oklch(0.6231_0.1880_41.11_/_0.15)]">
          {lastWord}
        </span>
      )}
      {!reduced && (
        <motion.span
          aria-hidden
          className={cn(
            "ml-0.5 inline-block w-[3px] -mb-0.5 rounded-full bg-primary/90",
            lastWord.length === 0 ? "h-[0.9em]" : "h-[0.95em]"
          )}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
        />
      )}
    </span>
  );
}
