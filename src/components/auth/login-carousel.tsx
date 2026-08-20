"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import fonteIllustration from "../../../design/references/fonte-illustration.png";
import remiseLivraison from "../../../design/references/remise-livraison.png";
import motifMainsFeu from "../../../design/references/motif-mains-feu.png";

const SLIDES: { image: StaticImageData; legende: string }[] = [
  { image: fonteIllustration, legende: "Coulée à la main, four après four." },
  { image: motifMainsFeu, legende: "Un savoir-faire transmis de main en main." },
  { image: remiseLivraison, legende: "Jusque chez vous, où que vous soyez." },
];

// Rotation auto toutes les 5s, en pause si l'onglet n'est pas visible
// (pas la peine de tourner un carrousel que personne ne regarde, surtout
// sur une connexion 3G qu'on veut économiser).
export function LoginCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalle = setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % SLIDES.length);
      }
    }, 5000);
    return () => clearInterval(intervalle);
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-encre md:aspect-auto md:h-full">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.legende}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={i === 0}
          />
          {/* Dégradé fixe (pas from-encre) : la légende doit rester lisible sur
              la photo dans les deux thèmes, indépendamment du flip encre/creme. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-display text-lg text-accent-fg">
            {slide.legende}
          </p>
        </div>
      ))}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.legende}
            className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-creme" : "bg-creme/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
