import { useCallback, useEffect, useRef, useState } from 'react';
// @ts-expect-error React Bits JS-CSS registry item is intentionally installed as JSX.
import InfiniteMenu from '../components/ReactBits/InfiniteMenu.jsx';
import './InfiniteMenuTestPage.css';

const items = [
  {
    image: 'https://picsum.photos/seed/test-menu-1/900/900?grayscale',
    link: 'https://google.com/',
    title: 'Item 1',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://picsum.photos/seed/test-menu-2/900/900?grayscale',
    link: 'https://google.com/',
    title: 'Item 2',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://picsum.photos/seed/test-menu-3/900/900?grayscale',
    link: 'https://google.com/',
    title: 'Item 3',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://picsum.photos/seed/test-menu-4/900/900?grayscale',
    link: 'https://google.com/',
    title: 'Item 4',
    description: 'This is pretty cool, right?'
  }
];

const AUTO_ADVANCES_BEFORE_SEQUENCE = 3;
const TEST_MOVEMENT_SPEED_MULTIPLIER = 2;
const MENU_AUTO_ADVANCE_DELAY = 3000 / TEST_MOVEMENT_SPEED_MULTIPLIER;
const MENU_AUTO_ADVANCE_DURATION = 2000 / TEST_MOVEMENT_SPEED_MULTIPLIER;
const STAGE_DURATION = 2700;

type SequenceStage =
  | 'stack'
  | 'frontend'
  | 'api'
  | 'services'
  | 'data'
  | 'seo'
  | 'performance'
  | 'security'
  | 'devops'
  | 'delivery';

const customStages: SequenceStage[] = [
  'stack',
  'frontend',
  'api',
  'services',
  'data',
  'seo',
  'performance',
  'security',
  'devops',
  'delivery'
];

export default function InfiniteMenuTestPage() {
  const [isHidden, setIsHidden] = useState(true);
  const [selectedItem, setSelectedItem] = useState<(typeof items)[number] | null>(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const advanceCountRef = useRef(0);
  const sequenceStartedRef = useRef(false);
  const sequenceIntervalRef = useRef<number | null>(null);

  const clearSequenceInterval = useCallback(() => {
    if (sequenceIntervalRef.current !== null) {
      window.clearInterval(sequenceIntervalRef.current);
      sequenceIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const preloadedImages = items.map(item => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = item.image;
      return image;
    });

    const timer = window.setTimeout(() => {
      setIsHidden(false);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
      clearSequenceInterval();
      preloadedImages.forEach(image => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [clearSequenceInterval]);

  const handleAutoAdvanceComplete = useCallback((index: number, item?: (typeof items)[number]) => {
    if (sequenceStartedRef.current) return;

    advanceCountRef.current += 1;

    if (advanceCountRef.current >= AUTO_ADVANCES_BEFORE_SEQUENCE) {
      const capturedItem = item ?? items[index % items.length];
      sequenceStartedRef.current = true;
      clearSequenceInterval();
      setSelectedItem(capturedItem);
      setSequenceIndex(0);

      sequenceIntervalRef.current = window.setInterval(() => {
        setSequenceIndex(current => (current + 1) % customStages.length);
      }, STAGE_DURATION);
    }
  }, [clearSequenceInterval]);

  const isSequenceActive = selectedItem !== null;
  const sequenceStage = customStages[sequenceIndex];

  return (
    <main className="infinite-menu-test-page">
      <div className={`infinite-menu-test-frame ${isSequenceActive ? 'is-sequence-active' : ''}`}>
        {isHidden && !isSequenceActive && <div className="infinite-menu-test-loader" />}

        <div
          className={[
            'infinite-menu-test-scene',
            'infinite-menu-test-canvas',
            'infinite-menu-test-menu',
            isHidden ? 'is-hidden' : 'is-visible',
            isSequenceActive ? 'is-handing-off' : ''
          ].join(' ')}
        >
          <InfiniteMenu
            items={items}
            scale={1}
            autoAdvanceDelay={MENU_AUTO_ADVANCE_DELAY}
            autoAdvanceDuration={MENU_AUTO_ADVANCE_DURATION}
            onAutoAdvanceComplete={handleAutoAdvanceComplete}
          />
        </div>

        {selectedItem && (
          <CustomSequence
            key={`${sequenceStage}-${sequenceIndex}`}
            stage={sequenceStage}
            item={selectedItem}
            stageNumber={sequenceIndex + 1}
          />
        )}
      </div>
    </main>
  );
}

function CustomSequence({
  stage,
  item,
  stageNumber
}: {
  stage: SequenceStage;
  item: (typeof items)[number];
  stageNumber: number;
}) {
  return (
    <section className={`custom-sequence custom-sequence-${stage}`} aria-label={`${stage} animation`}>
      <div className="sequence-counter">{String(stageNumber).padStart(2, '0')}</div>

      {stage === 'stack' && <StackStage item={item} />}
      {stage === 'frontend' && <FrontendStage item={item} />}
      {stage === 'api' && <ApiStage />}
      {stage === 'services' && <ServicesStage />}
      {stage === 'data' && <DataStage />}
      {stage === 'seo' && <SeoStage />}
      {stage === 'performance' && <PerformanceStage />}
      {stage === 'security' && <SecurityStage />}
      {stage === 'devops' && <DevopsStage />}
      {stage === 'delivery' && <DeliveryStage item={item} />}
    </section>
  );
}

function StageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="stage-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

function StackStage({ item }: { item: (typeof items)[number] }) {
  const orbitWords = ['React', 'TypeScript', 'Node', 'Postgres', 'Docker', 'SEO'];

  return (
    <div className="stage stage-stack">
      <img className="stage-anchor-image" src={item.image} alt="" />
      <StageTitle
        eyebrow="Full-stack engineering"
        title="One product, many moving parts"
        body="Interfaces, APIs, data models, delivery, and polish moving as one system."
      />
      <div className="kinetic-orbit" aria-hidden="true">
        {orbitWords.map((label, index) => (
          <span key={label} style={{ animationDelay: `${index * 0.09}s` }}>
            {label}
          </span>
        ))}
      </div>
      <div className="stack-axis" aria-hidden="true">
        {['UI', 'API', 'Services', 'Data'].map((label, index) => (
          <strong key={label} style={{ animationDelay: `${index * 0.12}s` }}>
            {label}
          </strong>
        ))}
      </div>
    </div>
  );
}

function FrontendStage({ item }: { item: (typeof items)[number] }) {
  const codeLines = [
    'const page = compose(semanticHTML, motion, accessibility);',
    'hydrate(<Portfolio sections={cleanContent} />);',
    'await renderAboveTheFold({ fast: true, stable: true });',
    'measure("interaction", event => keepItSmooth(event));'
  ];

  return (
    <div className="stage stage-frontend">
      <StageTitle
        eyebrow="Clean websites"
        title="UI that builds itself into place"
        body="Accessible layouts, responsive states, and details that move without breaking the page."
      />
      <div className="frontend-render" aria-hidden="true">
        <img src={item.image} alt="" />
        {Array.from({ length: 12 }).map((_, index) => (
          <i key={index} style={{ animationDelay: `${index * 0.045}s` }} />
        ))}
      </div>
      <div className="code-stream" aria-hidden="true">
        {codeLines.map((line, index) => (
          <span key={line} style={{ animationDelay: `${index * 0.14}s` }}>
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function ApiStage() {
  const lanes = ['/api/projects', '/api/search', '/api/auth', '/api/contact'];

  return (
    <div className="stage stage-api">
      <StageTitle
        eyebrow="API design"
        title="Requests move through clear contracts"
        body="Typed boundaries, validation, caching, retries, and predictable responses."
      />
      <div className="request-lanes" aria-hidden="true">
        {lanes.map((lane, index) => (
          <span key={lane} style={{ animationDelay: `${index * 0.1}s` }}>
            <b>{lane}</b>
            <i />
          </span>
        ))}
      </div>
      <div className="api-verbs" aria-hidden="true">
        {['GET', 'POST', 'PATCH', '200 OK', 'CACHE HIT'].map((label, index) => (
          <strong key={label} style={{ animationDelay: `${index * 0.08}s` }}>
            {label}
          </strong>
        ))}
      </div>
    </div>
  );
}

function ServicesStage() {
  const services = ['Gateway', 'Users', 'Billing', 'Search', 'Jobs', 'Email', 'Media'];

  return (
    <div className="stage stage-services">
      <StageTitle
        eyebrow="Microservices"
        title="Services coordinate without getting tangled"
        body="Ownership, queues, health checks, retries, and observability across the system."
      />
      <div className="service-constellation" aria-hidden="true">
        {services.map((label, index) => (
          <span key={label} style={{ animationDelay: `${index * 0.075}s` }}>
            {label}
          </span>
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <i key={index} style={{ animationDelay: `${index * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}

function DataStage() {
  const rows = ['SELECT projects', 'JOIN metrics', 'WHERE published', 'ORDER BY impact', 'LIMIT 12'];

  return (
    <div className="stage stage-data">
      <StageTitle
        eyebrow="Data modeling"
        title="Schemas that stay readable at speed"
        body="Indexes, migrations, analytics events, and query paths that are easy to trust."
      />
      <div className="data-stream" aria-hidden="true">
        {rows.map((row, index) => (
          <span key={row} style={{ animationDelay: `${index * 0.12}s` }}>
            {row}
          </span>
        ))}
        <div className="data-grid">
          {Array.from({ length: 36 }).map((_, index) => (
            <i key={index} style={{ animationDelay: `${index * 0.018}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SeoStage() {
  const tags = ['<title>', 'schema.org', 'canonical', 'sitemap.xml', 'meta description', '<article>'];

  return (
    <div className="stage stage-seo">
      <StageTitle
        eyebrow="SEO websites"
        title="Search bots can read the story"
        body="Semantic HTML, structured content, crawlable routes, metadata, and fast first paint."
      />
      <div className="seo-crawler" aria-hidden="true">
        <i />
        {tags.map((tag, index) => (
          <span key={tag} style={{ animationDelay: `${index * 0.09}s` }}>
            {tag}
          </span>
        ))}
      </div>
      <div className="seo-headline" aria-hidden="true">
        <strong>clean architecture</strong>
        <strong>fast pages</strong>
        <strong>semantic content</strong>
      </div>
    </div>
  );
}

function PerformanceStage() {
  const metrics = [
    ['LCP', '1.2s'],
    ['CLS', '0.01'],
    ['INP', '82ms'],
    ['TTFB', '180ms']
  ];

  return (
    <div className="stage stage-performance">
      <StageTitle
        eyebrow="Performance"
        title="Every millisecond has a job"
        body="Bundle discipline, image strategy, server timing, caching, and Core Web Vitals."
      />
      <div className="perf-readout" aria-hidden="true">
        {metrics.map(([label, value], index) => (
          <span key={label} style={{ animationDelay: `${index * 0.1}s` }}>
            <span>{label}</span>
            <strong>{value}</strong>
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

function SecurityStage() {
  const checks = ['OAuth flow', 'RBAC matrix', 'Secret rotation', 'Rate limits', 'Audit trail'];

  return (
    <div className="stage stage-security">
      <StageTitle
        eyebrow="Secure systems"
        title="Trust moves with every request"
        body="Auth, permissions, secrets, rate limits, audit logs, and defensive defaults."
      />
      <div className="security-scan" aria-hidden="true">
        <i />
        {checks.map((check, index) => (
          <span key={check} style={{ animationDelay: `${index * 0.08}s` }}>
            {check}
          </span>
        ))}
      </div>
    </div>
  );
}

function DevopsStage() {
  const steps = ['commit', 'test', 'build', 'release', 'observe', 'rollback'];

  return (
    <div className="stage stage-devops">
      <StageTitle
        eyebrow="CI/CD"
        title="Shipping becomes a repeatable motion"
        body="Automated checks, preview builds, containers, telemetry, and rollback paths."
      />
      <div className="deploy-conveyor" aria-hidden="true">
        {steps.map((label, index) => (
          <span key={label} style={{ animationDelay: `${index * 0.1}s` }}>
            {label}
          </span>
        ))}
        {Array.from({ length: 4 }).map((_, index) => (
          <i key={index} style={{ animationDelay: `${index * 0.38}s` }} />
        ))}
      </div>
    </div>
  );
}

function DeliveryStage({ item }: { item: (typeof items)[number] }) {
  const words = ['polished', 'full-stack', 'production', 'SEO-ready', 'scalable', 'clean'];

  return (
    <div className="stage stage-delivery">
      <img className="delivery-ghost-image" src={item.image} alt="" />
      <StageTitle
        eyebrow="Software engineer"
        title="Build it clean. Make it move. Ship it."
        body="Full-stack products with professional motion, sharp text, and production-minded systems."
      />
      <div className="delivery-word-field" aria-hidden="true">
        {words.map((word, index) => (
          <span key={word} style={{ animationDelay: `${index * 0.08}s` }}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
