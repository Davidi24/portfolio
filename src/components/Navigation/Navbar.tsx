import { type MouseEvent as ReactMouseEvent, useEffect, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import GooeyNav from './GooeyNav';
import Magnet from './Magnet';
import StaggeredMenu from './StaggeredMenu';
import type { StaggeredMenuItem } from './StaggeredMenu';
import { ANALYTICS_LOCATION_CHANGE_EVENT, trackCvDownload } from '../Analytics/analyticsEvents';
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

const TRACKED_SECTION_IDS = navItems.map(item => item.href.slice(1));
const DARK_SECTION_IDS = ['about', 'projects'];

const MENU_COLORS = {
  limeAccent: '#C6F435',
  dividerGray: '#2A2A2A',
  textGray: '#666A70',
  white: '#FFFFFF',
  charcoal: '#1E1E1E',
};

const MENU_BUTTON_BACKGROUND_BY_SECTION: Record<string, string> = {
  about: MENU_COLORS.white,
  experience: MENU_COLORS.white,
  projects: MENU_COLORS.charcoal,
  contact: MENU_COLORS.white,
};

const MENU_BUTTON_COLOR_BY_SECTION: Record<string, string> = {
  about: MENU_COLORS.charcoal,
  experience: MENU_COLORS.charcoal,
  projects: MENU_COLORS.white,
  contact: MENU_COLORS.charcoal,
};

const MOBILE_NAV_QUERY = '(max-width: 1150px)';
const CV_LABEL = 'Download CV';
const NAV_TRANSITION_EVENT = 'portfolio:navigation-transition';
const EXPERIENCE_NAV_OFFSET_RATIO = 0.08;
const CV_OPTIONS = [
  { label: 'English', href: '/cv-en.pdf', download: 'David-CV-English.pdf' },
  { label: 'Deutsch', href: '/cv-de.pdf', download: 'David-CV-Deutsch.pdf' },
] as const;

type PortfolioWindow = Window & {
  portfolioLenis?: {
    scrollTo: (
      target: HTMLElement | string | number,
      options?: { duration?: number; immediate?: boolean; force?: boolean }
    ) => void;
  };
};

type NavigationTransitionDetail = {
  onCovered?: () => void;
};

export default function Navbar() {
  const [isMobileNav, setIsMobileNav] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_NAV_QUERY).matches
  );
  const [cvMenuOpen, setCvMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [inDarkSection, setInDarkSection] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [navReady, setNavReady] = useState(false);
  const [playHomeAutoHover, setPlayHomeAutoHover] = useState(true);

  useEffect(() => {
    if (!cvMenuOpen) return;

    const closeCvMenu = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('.nav-cv-menu-wrap')) {
        setCvMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeCvMenu);
    return () => document.removeEventListener('mousedown', closeCvMenu);
  }, [cvMenuOpen]);

  useEffect(() => {
    const id = window.setTimeout(() => setNavReady(true), 1700);
    return () => window.clearTimeout(id);
  }, []);

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
      const probeY = window.scrollY + window.innerHeight * 0.15;
      const activeId = TRACKED_SECTION_IDS.reduce((current, id) => {
        const el = document.getElementById(id);
        if (!el) return current;
        const top = window.scrollY + el.getBoundingClientRect().top;
        return probeY >= top - 1 ? id : current;
      }, '');
      const inDark = DARK_SECTION_IDS.includes(activeId);
      setActiveSectionId(activeId);
      setInDarkSection(inDark);
    };

    window.addEventListener('scroll', checkSection, { passive: true });
    checkSection();
    return () => window.removeEventListener('scroll', checkSection);
  }, []);

  const sectionMenuButtonBackground = MENU_BUTTON_BACKGROUND_BY_SECTION[activeSectionId];
  const sectionMenuButtonColor = MENU_BUTTON_COLOR_BY_SECTION[activeSectionId];
  const panelColor = sectionMenuButtonBackground ?? (inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal);
  const itemColor = sectionMenuButtonBackground
    ? sectionMenuButtonColor
    : inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white;
  const desktopMenuButtonBackground = sectionMenuButtonBackground ?? (inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal);
  const desktopMenuButtonColor = sectionMenuButtonColor ?? (inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white);
  const mobileMenuButtonColor = sectionMenuButtonColor ?? (inDarkSection ? MENU_COLORS.white : MENU_COLORS.charcoal);
  const mobileOpenMenuButtonColor = sectionMenuButtonColor ?? (inDarkSection ? MENU_COLORS.charcoal : MENU_COLORS.white);
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

  const smoothScrollToHref = (href: string, options: { immediate?: boolean } = {}) => {
    if (!href.startsWith('#')) return false;

    const targetId = href.slice(1);
    const immediate = options.immediate ?? false;
    const targetOffset = targetId === 'experience'
      ? Math.round(window.innerHeight * EXPERIENCE_NAV_OFFSET_RATIO)
      : 0;

    if (targetId === 'home') {
      window.history.pushState(null, '', href);
      window.dispatchEvent(new Event(ANALYTICS_LOCATION_CHANGE_EVENT));

      const lenis = (window as PortfolioWindow).portfolioLenis;
      if (lenis) {
        lenis.scrollTo(0, immediate ? { immediate: true, force: true } : { duration: 1.15 });
      } else {
        window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
      }

      return true;
    }

    const target = document.getElementById(targetId);
    if (!target) return false;

    window.history.pushState(null, '', href);
    window.dispatchEvent(new Event(ANALYTICS_LOCATION_CHANGE_EVENT));

    const lenis = (window as PortfolioWindow).portfolioLenis;
    const targetScroll = window.scrollY + target.getBoundingClientRect().top + targetOffset;
    if (lenis) {
      lenis.scrollTo(targetScroll, immediate ? { immediate: true, force: true } : { duration: 1.15 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: immediate ? 'auto' : 'smooth' });
    }

    return true;
  };

  const handleNavClick = (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;

    const targetId = href.slice(1);
    const targetExists = targetId === 'home' || Boolean(document.getElementById(targetId));
    if (!targetExists) return;

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    if (cvMenuOpen) {
      setCvMenuOpen(false);
    }

    window.dispatchEvent(new CustomEvent<NavigationTransitionDetail>(NAV_TRANSITION_EVENT, {
      detail: {
        onCovered: () => smoothScrollToHref(href, { immediate: true }),
      },
    }));
  };

  const handleCvDownloadClick = (option: (typeof CV_OPTIONS)[number]) => {
    trackCvDownload({ source: 'navbar', language: option.label });
    setCvMenuOpen(false);
  };

  const renderCvMenu = () => (
    <div className={`nav-cv-menu-wrap${cvMenuOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="nav-cta"
        aria-label={CV_LABEL}
        aria-haspopup="menu"
        aria-expanded={cvMenuOpen}
        onClick={() => setCvMenuOpen(open => !open)}
      >
        <span className="nav-cta-label">{CV_LABEL}</span>
        <span className="nav-cta-bridge" />
        <span className="nav-cta-arrow" aria-hidden="true">
          <FiArrowUpRight className="nav-cta-arrow-icon" />
        </span>
      </button>
      <div className="nav-cv-menu" role="menu" aria-label="Choose CV language">
        {CV_OPTIONS.map(option => (
          <a
            key={option.label}
            href={option.href}
            download={option.download}
            className="nav-cv-option"
            role="menuitem"
            onClick={() => handleCvDownloadClick(option)}
          >
            {option.label}
          </a>
        ))}
      </div>
    </div>
  );

  if (isMobileNav) {
    return (
      <>
        <header className={`site-header site-header-mobile${inDarkSection ? ' is-over-dark' : ''}`}>
          <a href="#home" className="nav-logo" aria-label="Go to home" onClick={event => handleNavClick(event, '#home')}>
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
          onItemClick={(event, item) => handleNavClick(event, item.link)}
          closeOnClickAway
        />
      </>
    );
  }

  return (
    <>
      <header className={`site-header${inDarkSection ? ' is-over-dark' : ''}`}>
        {!scrolled && (
          <Magnet
            magnetStrength={3}
            padding={cvMenuOpen ? 180 : 60}
            style={{ position: 'absolute', top: 0, right: 'var(--desktop-edge-gutter, 2rem)', zIndex: 1, pointerEvents: 'all' }}
          >
            {renderCvMenu()}
          </Magnet>
        )}

        {!scrolled && navReady && (
          <div className="nav-shell">
            <GooeyNav
              items={gooeyItems}
              autoHoverDelay={playHomeAutoHover ? 1150 : undefined}
              onAutoHoverStart={() => setPlayHomeAutoHover(false)}
              onItemClick={(event, item) => handleNavClick(event, item.href)}
            />
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
          onItemClick={(event, item) => handleNavClick(event, item.link)}
          closeOnClickAway
        />
      )}
    </>
  );
}
