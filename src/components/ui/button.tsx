import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";
type Size = "sm" | "default" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-braise text-accent-fg",
  secondary: "bg-surface text-encre/80",
  ghost: "bg-creme text-encre/70",
  success: "bg-vert text-accent-fg",
  danger: "bg-litige text-accent-fg",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  default: "px-4 py-3 text-base",
  lg: "px-4 py-4 text-lg",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

// Coins carrés partout, volontairement : les boutons tranchent sur les
// cartes/conteneurs (qui gardent leurs coins arrondis) plutôt que de tout
// uniformiser — c'est ce contraste qui porte la direction artistique.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "default", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`rounded-none font-medium disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
});
