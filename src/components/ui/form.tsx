"use client";

import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTROL = "w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

/** Label wrapping one control, with an optional hint below it. */
export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, "h-10 font-normal", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-28 py-2 font-normal", className)} {...props} />;
}

interface FormMessageProps {
  result: { status: "idle" | "done" | "failed"; message?: string };
}

/** Outcome of the last submission, announced to assistive technology. */
export function FormMessage({ result }: FormMessageProps) {
  if (result.status === "idle") {
    return null;
  }
  const failed = result.status === "failed";
  return (
    <p role={failed ? "alert" : "status"} className={cn("text-sm", failed ? "text-destructive" : "text-success")}>
      {result.message}
    </p>
  );
}

interface SubmitButtonProps {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  name?: string;
  value?: string;
}

/** Submit button that disables itself while its form is being sent. */
export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? "Enviando…" : children}
    </Button>
  );
}
