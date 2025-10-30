"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group@1.2.3";
import { CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const ariaInvalid = (props as any)['aria-invalid'];
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const focusClasses = isInvalid
    ? 'focus-visible:border-destructive focus-visible:ring-destructive focus-visible:ring-0.5'
    : 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';
  const borderClass = isInvalid ? 'border-destructive' : 'border-input';

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        `${borderClass} text-primary ${focusClasses} aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
