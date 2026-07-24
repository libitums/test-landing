import type {
  ComponentProps,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

function controlClassName(base: string, className?: string) {
  return `${base} ${className ?? ""}`.trim();
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return <input type={type} className={controlClassName("ui-input", className)} {...props} />;
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={controlClassName("ui-textarea", className)} {...props} />;
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <span className="ui-select-root">
      <select className={controlClassName("ui-select", className)} {...props} />
      <ChevronDown className="ui-select-icon" aria-hidden="true" strokeWidth={2} />
    </span>
  );
}

export type CheckboxProps = Omit<ComponentProps<"input">, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input type="checkbox" className={controlClassName("ui-checkbox", className)} {...props} />
  );
}
