"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { DotsNineIcon, UserCircleIcon, XIcon } from "@phosphor-icons/react";
import type { AppRole } from "@/lib/supabase/types";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeQuickToggle } from "@/components/layout/theme-quick-toggle";
import { ROLE_LABELS, estActif, navigationPour, type NavItem } from "@/components/layout/navigation";
import { Logo } from "@/components/ui/logo";

type Profil = { nom: string; role: AppRole; avatarUrl?: string | null };

function Avatar({ nom, avatarUrl, taille = 44 }: { nom: string; avatarUrl?: string | null; taille?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-laiton/25 font-display text-lg text-encre"
      style={{ width: taille, height: taille }}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" width={taille} height={taille} className="h-full w-full object-cover" />
      ) : (
        nom.charAt(0).toUpperCase()
      )}
    </span>
  );
}

// ─── Menu latéral (ordinateur / tablette) ────────────────────────────────

function MenuLateral({ profil, items, pathname }: { profil: Profil; items: NavItem[]; pathname: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-6 border-r border-encre/10 bg-surface px-4 py-6 md:flex">
      <Link href={items[0].href} className="flex items-center gap-3 px-3">
        <Logo hauteur={40} decoratif />
        <span className="font-display text-2xl text-encre">LFstaff</span>
      </Link>

      <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const actif = estActif(item, pathname);
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={actif ? "page" : undefined}
              className={`relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-base transition-colors ${
                actif ? "font-semibold text-braise" : "text-encre/75 hover:bg-creme hover:text-encre"
              }`}
            >
              {actif && (
                <motion.span
                  layoutId="nav-lateral-actif"
                  className="absolute inset-0 rounded-xl bg-braise/12"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  aria-hidden="true"
                >
                  <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-braise" />
                </motion.span>
              )}
              <Icone size={26} weight={actif ? "fill" : "duotone"} className="relative icone-duo" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-encre/10 pt-4">
        <Link
          href="/profil"
          aria-current={pathname === "/profil" ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-creme ${
            pathname === "/profil" ? "bg-braise/12" : ""
          }`}
        >
          <Avatar nom={profil.nom} avatarUrl={profil.avatarUrl} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base font-semibold text-encre">{profil.nom}</span>
            <span className="text-sm text-encre/65">{ROLE_LABELS[profil.role]}</span>
          </span>
        </Link>
        <ThemeQuickToggle avecLibelle />
        <SignOutButton avecIcone />
      </div>
    </aside>
  );
}

// ─── En-tête (téléphone) ─────────────────────────────────────────────────

function EnTeteMobile({ profil }: { profil: Profil }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-encre/10 bg-creme/90 px-4 py-2 backdrop-blur md:hidden">
      <Link href="/profil" className="flex min-w-0 items-center gap-3">
        <Avatar nom={profil.nom} avatarUrl={profil.avatarUrl} taille={40} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-display text-lg leading-tight text-encre">{profil.nom}</span>
          <span className="text-sm text-encre/65">{ROLE_LABELS[profil.role]}</span>
        </span>
      </Link>
      <ThemeQuickToggle />
    </header>
  );
}

// ─── Barre d'onglets (téléphone) ─────────────────────────────────────────

function BarreMobile({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const dansBarre = items.filter((item) => item.barreMobile);
  const reste = items.filter((item) => !item.barreMobile);
  const resteActif = reste.some((item) => estActif(item, pathname)) || pathname === "/profil";

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-encre/10 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="flex items-stretch justify-around">
          {dansBarre.map((item) => {
            const actif = estActif(item, pathname);
            const Icone = item.icone;

            if (item.principal) {
              return (
                <li key={item.href} className="flex flex-1 justify-center">
                  <Link
                    href={item.href}
                    aria-current={actif ? "page" : undefined}
                    className="-mt-5 flex flex-col items-center gap-1 text-sm font-semibold text-encre"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-braise text-accent-fg shadow-lg shadow-braise/30 ring-4 ring-surface transition-transform active:scale-95">
                      <Icone size={30} weight="fill" />
                    </span>
                    {item.labelCourt ?? item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href} className="flex flex-1">
                <Link
                  href={item.href}
                  aria-current={actif ? "page" : undefined}
                  className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm transition-colors ${
                    actif ? "font-semibold text-braise" : "text-encre/70"
                  }`}
                >
                  <span className="relative flex h-8 w-14 items-center justify-center">
                    {actif && (
                      <motion.span
                        layoutId="nav-mobile-actif"
                        className="absolute inset-0 rounded-full bg-braise/15"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        aria-hidden="true"
                      />
                    )}
                    <Icone size={26} weight={actif ? "fill" : "duotone"} className="relative icone-duo" />
                  </span>
                  {item.labelCourt ?? item.label}
                </Link>
              </li>
            );
          })}

          {reste.length > 0 && (
            <li className="flex flex-1">
              <button
                type="button"
                onClick={() => sheetRef.current?.showModal()}
                aria-haspopup="dialog"
                className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm ${
                  resteActif ? "font-semibold text-braise" : "text-encre/70"
                }`}
              >
                <span className="relative flex h-8 w-14 items-center justify-center">
                  {resteActif && (
                    <span className="absolute inset-0 rounded-full bg-braise/15" aria-hidden="true" />
                  )}
                  <DotsNineIcon size={26} weight={resteActif ? "fill" : "duotone"} className="relative icone-duo" />
                </span>
                Plus
              </button>
            </li>
          )}
        </ul>
      </nav>

      {reste.length > 0 && (
        <dialog
          ref={sheetRef}
          aria-label="Plus de rubriques"
          onClick={(event) => {
            if (event.target === event.currentTarget) sheetRef.current?.close();
          }}
          className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-encre/45 md:hidden"
        >
          <div className="flex flex-col gap-5 rounded-t-[2rem] bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl text-encre">Toutes les rubriques</p>
              <button
                type="button"
                onClick={() => sheetRef.current?.close()}
                aria-label="Fermer"
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-creme"
              >
                <XIcon size={22} weight="bold" />
              </button>
            </div>

            <ul className="grid grid-cols-3 gap-3">
              {[...reste, { href: "/profil", label: "Mon profil", icone: UserCircleIcon } as NavItem].map((item) => {
                const actif = estActif(item, pathname);
                const Icone = item.icone;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => sheetRef.current?.close()}
                      aria-current={actif ? "page" : undefined}
                      className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-2 text-center text-sm leading-tight transition-transform active:scale-95 ${
                        actif ? "bg-braise text-accent-fg font-semibold" : "bg-creme text-encre"
                      }`}
                    >
                      <Icone size={34} weight={actif ? "fill" : "duotone"} className={actif ? "" : "icone-duo"} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <SignOutButton avecIcone />
          </div>
        </dialog>
      )}
    </>
  );
}

// ─── Coque ───────────────────────────────────────────────────────────────

export function AppShell({ profil, children }: { profil: Profil; children: ReactNode }) {
  const pathname = usePathname();
  const items = navigationPour(profil.role);

  return (
    <div className="flex min-h-dvh bg-creme">
      <MenuLateral profil={profil} items={items} pathname={pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <EnTeteMobile profil={profil} />
        {/* Entrée douce de chaque page (fondu + légère montée). La clé suit
            l'URL : l'animation rejoue à chaque navigation, pas à chaque
            rafraîchissement des données. Le mouvement est coupé par
            MotionConfig (voir providers.tsx) si les animations sont réduites. */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-28 md:px-6 md:pb-10 md:pt-4"
        >
          {children}
        </motion.div>
      </div>

      <BarreMobile items={items} pathname={pathname} />
    </div>
  );
}
