import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full ",
      (className?.split(" ").filter((prop) => prop.startsWith("primitive-"))
        .length == 0
        ? "bg-secondary"
        : null) +
        " " +
        className
          ?.split(" ")
          .filter((prop) => !prop.startsWith("indicator-"))
          .join(" ")
          .replace(/primitive-/gi, "")
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={
        "h-full w-full flex-1 transition-all " +
        className
          ?.split(" ")
          .filter((prop) => prop.startsWith("indicator-"))
          .join(" ")
          .replace(/indicator-/gi, "") +
        " " +
        (className?.split(" ").filter((prop) => prop.startsWith("indicator-"))
          .length == 0
          ? "bg-primary"
          : null)
      }
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
