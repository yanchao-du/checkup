"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  className?: string;
  size?: CheckboxSize;
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
}

function Checkbox({
  className,
  size = 'md',
  ...props
}: CheckboxProps) {
  // Map logical sizes to Tailwind utility classes
  const sizeMap: Record<CheckboxSize, { root: string; icon: string }> = {
    sm: { root: 'w-4 h-4', icon: 'w-3 h-3' },
    md: { root: 'w-5 h-5', icon: 'w-4 h-4' },
    lg: { root: 'w-6 h-6 border-2', icon: 'w-5 h-5' },
  };

  const classes = cn(
    // base styles
    'peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
    // size specific
    sizeMap[size].root,
    className,
  );

  return (
    <CheckboxPrimitive.Root data-slot="checkbox" className={classes} {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current transition-none">
        <CheckIcon className={sizeMap[size].icon} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
