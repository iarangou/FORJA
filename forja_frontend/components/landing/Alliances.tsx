"use client";

import { useState } from "react";


const alliances = [
  {
    name: "Fe y Alegría",
    image: "/images/landing/fe-alegria.png",
  },
  {
    name: "Fundación Club Campestre de Cali",
    image: "/images/landing/club-campestre.png",
  },
  {
    name: "Nuestra Génesis",
    image: "/images/landing/genesis.png",
  },
  {
    name: "Instituto Mayor Campesino",
    image: "/images/landing/inca.png",
  },
];

export default function Alliances() {
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCards = 3;
  const maxIndex = Math.max(0, alliances.length - visibleCards);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const previous = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="section partners-section" id="alianzas">
      <div className="container">
        <div className="section-heading partners-heading">
          <div>
            <span className="eyebrow">
              03 / CONSTRUIMOS CON OTROS
            </span>
            <h2>
              Las alianzas hacen
              <br />
              <span className="purple">posible el cambio.</span>
            </h2>
          </div>

          <p>
            Conoce algunas de las organizaciones que acompañan
            el trabajo de FORJA.
          </p>
        </div>

        <div className="carousel-header">
          
        <span id="carousel-status" aria-live="polite">
         Mostrando alianzas {currentIndex + 1} a{" "}
            {Math.min(currentIndex + visibleCards, alliances.length)} de{" "}
            {alliances.length}
        </span>


          <div className="carousel-controls">
            <button
              className="carousel-arrow"
              id="alliance-prev"
              type="button"
              aria-label="Ver alianzas anteriores"
              onClick={previous}
              disabled={currentIndex === 0}
            >
              ←
            </button>

            <button
              className="carousel-arrow"
              id="alliance-next"
              type="button"
              aria-label="Ver más alianzas"
              onClick={next}
              disabled={currentIndex === maxIndex}
            >
              →
            </button>
          </div>
        </div>

        <div className="alliance-viewport">
          <div className="alliance-track" id="alliance-track" style={{
            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            transition: "transform 0.4s ease",
            }}>
            {alliances.map((alliance) => (
              <article className="alliance-card" key={alliance.name}>
                <img
                  src={alliance.image}
                  alt={alliance.name}
                  loading="lazy"
                />
                <h3>{alliance.name}</h3>
              </article>
            ))}
          </div>
        </div>

    <div className="carousel-progress">
        <div
            id="carousel-progress-bar"
            style={{
                width: `${100 / (maxIndex + 1)}%`,
                transform: `translateX(${currentIndex * 100}%)`,
                transition: "transform 0.4s ease",
            }}
            ></div>
        </div>
      </div>
    </section>
  );
}
