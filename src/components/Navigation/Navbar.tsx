import { useEffect, useState } from 'react';
import GooeyNav from './GooeyNav';
import Magnet from './Magnet';
import StaggeredMenu from './StaggeredMenu';
import type { StaggeredMenuItem } from './StaggeredMenu';
import './Navbar.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

const gooeyItems = navItems.slice(0, 4);

const staggeredItems: StaggeredMenuItem[] = navItems.map(item => ({
  label: item.label,
  ariaLabel: item.label,
  link: item.href,
}));

const DARK_SECTION_IDS = ['about', 'projects'];

const MENU_COLORS = {
  limeAccent: '#C6F435',
  dividerGray: '#2A2A2A',
  textGray: '#666A70',
  white: '#FFFFFF',
  charcoal: '#1E1E1E',
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [inDarkSection, setInDarkSection] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const checkSection = () => {
      const midY = window.scrollY + window.innerHeight * 0.5;
      const inDark = DARK_SECTION_IDS.some(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const top = window.scrollY + el.getBoundingClientRect().top;
        const bottom = top + el.offsetHeight;
        return midY >= top && midY <= bottom;
      });
      setInDarkSection(inDark);
    };

    window.addEventListener('scroll', checkSection, { passive: true });
    checkSection();
    return () => window.removeEventListener('scroll', checkSection);
  }, []);

  const panelColor = inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal;
  const itemColor = inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white;
  const menuButtonBackground = inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal;
  const menuButtonColor = inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white;
  const menuLayers = inDarkSection
    ? [
        MENU_COLORS.limeAccent,
        MENU_COLORS.dividerGray,
        MENU_COLORS.limeAccent,
        MENU_COLORS.dividerGray,
        MENU_COLORS.limeAccent,
      ]
    : [
        MENU_COLORS.white,
        MENU_COLORS.limeAccent,
        MENU_COLORS.dividerGray,
        MENU_COLORS.white,
        MENU_COLORS.limeAccent,
      ];

  return (
    <>
      <header className="site-header">
        {!scrolled && (
          <Magnet magnetStrength={3} padding={60} style={{ position: 'absolute', right: '2rem', zIndex: 1, pointerEvents: 'all' }}>
            <a href="#contact" className="nav-cta">
              <span className="nav-cta-label">Contact</span>
              <span className="nav-cta-bridge" />
              <span className="nav-cta-arrow">↗</span>
            </a>
          </Magnet>
        )}

        {!scrolled && (
          <div className="nav-shell">
            <GooeyNav items={gooeyItems} />
          </div>
        )}
      </header>

      {scrolled && (
        <StaggeredMenu
          isFixed
          position="right"
          items={staggeredItems}
          colors={menuLayers}
          panelColor={panelColor}
          itemColor={itemColor}
          accentColor={MENU_COLORS.limeAccent}
          menuButtonBackground={menuButtonBackground}
          menuButtonColor={menuButtonColor}
          openMenuButtonColor={menuButtonColor}
          displaySocials={false}
          displayItemNumbering
          closeOnClickAway
        />
      )}
    </>
  );
}
