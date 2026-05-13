import { useEffect, useState } from "react";

import { heroSlides } from "../services/mockData";

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = heroSlides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 4500);
    return () => clearInterval(timer);
  }, [slideCount]);

  const activeSlide = heroSlides[activeIndex];

  return (
    <section className="hero">
      <div className="hero__content">
        <span className="eyebrow">Edition 2026</span>
        <h1>{activeSlide.title}</h1>
        <p>{activeSlide.subtitle}</p>
        <div className="hero__actions">
          <button className="button button--primary">{activeSlide.cta}</button>
          <button className="button button--ghost">Voir le lookbook</button>
        </div>
        <div className="hero__dots">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              className={
                index === activeIndex ? "dot dot--active" : "dot"
              }
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>
      <div className="hero__visual">
        <img src={activeSlide.image} alt={activeSlide.title} />
        <div className="hero__card">
          <strong>Livraison 24h</strong>
          <span>Sur les essentiels marques.</span>
        </div>
      </div>
    </section>
  );
}
