import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "default";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-braise text-accent-fg",
  secondary: "bg-surface text-encre/80",
  ghost: "bg-creme text-encre/70",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  default: "px-4 py-2 text-sm",
};

type LinkButtonProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: Variant;
    size?: Size;
  };

// Équivalent de Button, mais pour un lien (navigation, téléchargement) —
// mêmes coins carrés, même jeu de variantes/tailles.
export function LinkButton({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`inline-block rounded-none text-center font-medium ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
