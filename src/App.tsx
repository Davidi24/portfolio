import { Suspense, lazy, useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';
import Navbar from './components/Navigation/Navbar';
import Hero from './components/Hero/Hero';
import AboutMe from './components/About/AboutMe';
import CustomCursor from './components/Cursor/CustomCursor';
import ExperienceIntro from './components/Experience/ExperienceIntro';
import PortfolioFinale from './components/Finale/PortfolioFinale';
import AboutPage from './pages/AboutPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';

const InfiniteMenuTestPage = lazy(() => import('./pages/InfiniteMenuTestPage'));

function PortfolioHome() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });

    const updateScroll = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(updateScroll);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <Navbar />
      <Hero />
      <AboutMe />
      <ExperienceIntro />
      <PortfolioFinale />
    </>
  );
}

export default function App() {
  if (window.location.pathname === '/about') {
    return <AboutPage />;
  }

  if (window.location.pathname.startsWith('/work/')) {
    return <ProjectDetailPage />;
  }

  if (window.location.pathname.startsWith('/experience/')) {
    return <ExperienceDetailPage />;
  }

  const isInfiniteMenuTest =
    window.location.pathname === '/test' ||
    window.location.pathname === '/infinite-menu-test';

  if (isInfiniteMenuTest) {
    return (
      <Suspense fallback={null}>
        <InfiniteMenuTestPage />
      </Suspense>
    );
  }

  return <PortfolioHome />;
}
