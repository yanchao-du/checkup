import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const ariaInvalid = (props as any)["aria-invalid"];
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  const focusClass = isInvalid
    ? "focus-visible:border-destructive focus-visible:ring-destructive focus-visible:ring-0.5"
    : "focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-0.5";

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground",
        focusClass,
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
