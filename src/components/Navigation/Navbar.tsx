import { useEffect, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
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

const gooeyItems = navItems.filter(item => item.label !== 'Education');

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

const MOBILE_NAV_QUERY = '(max-width: 1150px)';
const CV_HREF = '/cv.pdf';
const CV_LABEL = 'Download CV';

export default function Navbar() {
  const [isMobileNav, setIsMobileNav] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_NAV_QUERY).matches
  );
  const [scrolled, setScrolled] = useState(false);
  const [inDarkSection, setInDarkSection] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_QUERY);
    const onChange = () => setIsMobileNav(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const checkSection = () => {
      const midY = window.scrollY + window.innerHeight * 0.15;
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
  const desktopMenuButtonBackground = inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal;
  const desktopMenuButtonColor = inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white;
  const mobileMenuButtonColor = inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal;
  const mobileOpenMenuButtonColor = inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white;
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

  if (isMobileNav) {
    return (
      <>
        <header className={`site-header site-header-mobile${inDarkSection ? ' is-over-dark' : ''}`}>
          <a href="#home" className="nav-logo" aria-label="Go to home">
            <img src="/logo.png" alt="" className="nav-logo-image" />
          </a>
        </header>

        <StaggeredMenu
          className="navbar-menu"
          isFixed
          position="right"
          items={staggeredItems}
          colors={menuLayers}
          panelColor={panelColor}
          itemColor={itemColor}
          accentColor={MENU_COLORS.limeAccent}
          menuButtonBackground="transparent"
          menuButtonColor={mobileMenuButtonColor}
          openMenuButtonColor={mobileOpenMenuButtonColor}
          changeMenuColorOnOpen
          displaySocials={false}
          displayItemNumbering
          closeOnClickAway
        />
      </>
    );
  }

  return (
    <>
      <header className="site-header">
        {!scrolled && (
          <Magnet
            magnetStrength={3}
            padding={60}
            style={{ position: 'absolute', top: 0, right: 'var(--desktop-edge-gutter, 2rem)', zIndex: 1, pointerEvents: 'all' }}
          >
            <a href={CV_HREF} download className="nav-cta" aria-label={CV_LABEL}>
              <span className="nav-cta-label">{CV_LABEL}</span>
              <span className="nav-cta-bridge" />
              <span className="nav-cta-arrow" aria-hidden="true">
                <FiArrowUpRight className="nav-cta-arrow-icon" />
              </span>
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
          menuButtonBackground={desktopMenuButtonBackground}
          menuButtonColor={desktopMenuButtonColor}
          openMenuButtonColor={desktopMenuButtonColor}
          displaySocials={false}
          displayItemNumbering
          closeOnClickAway
        />
      )}
    </>
  );
}
