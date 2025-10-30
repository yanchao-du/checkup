import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // aria-invalid can be boolean or the string "true"; normalize it
  const ariaInvalid = (props as any)["aria-invalid"];
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  const focusClass = isInvalid
    ? "focus-visible:border-destructive focus-visible:ring-destructive focus-visible:ring-0.5"
    : "focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-0.5";

  return (
    <input
      type={type}
      data-slot="input"
      autoComplete="off"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        focusClass,
        // keep the aria-invalid static classes for non-focused state
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
