"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Check, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "./utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  isCompleted?: boolean;
  isDisabled?: boolean;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, isCompleted, isDisabled, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-base transition-all text-left group",
          isDisabled && "opacity-50 cursor-not-allowed hover:no-underline",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <ChevronRight className="h-6 w-6 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90 group-data-[state=closed]:rotate-0" />
          <span className="text-lg">{children}</span>
        </div>
        <div
          className={cn(
            "rounded-full border-2 flex items-center justify-center transition-colors",
            isCompleted &&
              !isDisabled &&
              " group-data-[state=open]:bg-blue-500 group-data-[state=open]:border-blue-500 group-data-[state=closed]:w-4 group-data-[state=closed]:h-4 group-data-[state=open]:w-4 group-data-[state=open]:h-4 group-date-[state=open]:text-primary group-data-[state=closed]:bg-green-400 group-data-[state=closed]:border-green-400",
            !isCompleted &&
              !isDisabled &&
              "w-4 h-4 border-gray-500 bg-gray-500 group-data-[state=open]:bg-blue-500 group-data-[state=open]:border-blue-500",
            isDisabled && "border-gray-300 bg-gray-300 w-4 h-4 mr-1"
          )}
        >
          {isCompleted ? (
            <Check className=" group-data-[state=open]:text-blue-500 group-data-[state=closed]:text-white" />
          ) : (
            <span className={cn("rounded-full")} />
          )}
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
