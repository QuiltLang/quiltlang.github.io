import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import './Gallery.css';

export type GalleryItem = {
  title: string;
  href: string;
  /** Opens in a new tab and gets a ↗ marker. */
  external?: boolean;
  /** 16:10 preview image, under static/img/. */
  image: string;
  description: React.ReactNode;
  tags: string[];
  links?: { label: string; href: string }[];
};

const ROW = 4; // px; must match grid-auto-rows in Gallery.css

// Masonry: each card spans as many ROW-px grid rows as its height plus the
// gap, re-spanned whenever its height changes (images loading, text wrapping
// at a new width). Without JS the cards fall back to an even grid.
function useMasonry(ref: React.RefObject<HTMLUListElement | null>) {
  useEffect(() => {
    const grid = ref.current;
    if (!grid || !('ResizeObserver' in window)) return;
    grid.classList.add('masonry');
    const span = (card: Element) => {
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      (card as HTMLElement).style.gridRowEnd =
        'span ' + Math.ceil((card.getBoundingClientRect().height + gap) / ROW);
    };
    const ro = new ResizeObserver((entries) => entries.forEach((e) => span(e.target)));
    Array.from(grid.children).forEach((card) => {
      span(card);
      ro.observe(card);
    });
    return () => {
      ro.disconnect();
      grid.classList.remove('masonry');
    };
  }, [ref]);
}

function Card({ item }: { item: GalleryItem }) {
  // Internal targets are static pages outside the SPA router, so plain <a>
  // with target=_self (a full page load), not <Link>.
  const target = item.external ? { target: '_blank', rel: 'noopener' } : { target: '_self' };
  return (
    <li className="gal-card">
      <div className="gal-shot">
        <img src={item.image} alt="" loading="lazy" />
      </div>
      <h3>
        <a href={item.href} {...target}>{item.title}</a>
        {item.external && <span className="gal-ext" aria-label="(external)"> ↗</span>}
      </h3>
      <p>{item.description}</p>
      <div className="gal-links">
        {item.tags.map((t) => (
          <span key={t} className="gal-tag">#{t}</span>
        ))}
        {item.links?.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener">
            {l.label} <span className="gal-ext">↗</span>
          </a>
        ))}
      </div>
    </li>
  );
}

export default function Gallery(props: {
  title: string;
  description: string;
  subtitle: React.ReactNode;
  items: GalleryItem[];
}): React.ReactElement {
  const grid = useRef<HTMLUListElement>(null);
  useMasonry(grid);
  return (
    <Layout title={props.title} description={props.description}>
      <main className="gallery-page">
        <header className="gallery-hero">
          <h1>{props.title}</h1>
          <p>{props.subtitle}</p>
        </header>
        <ul className="gallery-grid" ref={grid}>
          {props.items.map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </ul>
      </main>
    </Layout>
  );
}
