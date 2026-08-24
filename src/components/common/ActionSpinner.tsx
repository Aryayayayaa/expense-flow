"use client";

type ActionSpinnerProps = {
  size?: "sm" | "md";
  className?: string;
};

export default function ActionSpinner({
  size = "sm",
  className = "",
}: ActionSpinnerProps) {
  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      className={`inline-block ${sizeClass} animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
