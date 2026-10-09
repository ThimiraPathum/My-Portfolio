import ResumeLink from '../components/ResumeLink';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useSettings } from '../context/useSettings';
import { getSafeUrl } from '../api';
import About from './About';
import Projects from './Projects';
import Skills from './Skills';
import Experience from './Experience';
import Contact from './Contact';
import RecentBlogs from '../components/RecentBlogs';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function Home() {
  const { settings, isLoading } = useSettings();
  const name = settings.home_name || 'Thimira Pathum';
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const description = settings.home_summary || 'ICT undergraduate at the University of Colombo. I build full-stack and AI applications, including MarketMentor with Python, FastAPI and React.';
  const socials = [
    { label: 'GitHub', icon: FiGithub, href: settings.social_github },
    { label: 'LinkedIn', icon: FiLinkedin, href: settings.social_linkedin },
    { label: 'Email', icon: FiMail, href: settings.social_email ? `mailto:${settings.social_email}` : '' },
  ].filter(social => social.href);

  if (isLoading) return null;

  return (
    <div className="relative">
      <main id="home-section" className="hero-section pb-10 pt-28 lg:pt-32">
        <div className="site-container grid items-center gap-9 md:grid-cols-[1.25fr_1fr] md:gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="order-2 min-w-0 text-center md:order-1 md:text-left">
            <div className="internship-badge mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium leading-relaxed text-left">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-700" />
              {settings.home_status || 'Open to internships · AI/ML & Software Engineering'}
            </div>
            <p className="hero-eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.12em]">Hello, I'm</p>
            <h1 className="mb-6 text-[3.25rem] font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl break-words"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {firstName}{rest.length > 0 && <><br /><span className="hero-accent">{rest.join(' ')}</span></>}
            </h1>
            <div className="hero-summary mx-auto max-w-xl text-base md:mx-0">
              <MarkdownRenderer content={description} />
            </div>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row md:justify-start">
              <Link to="/#projects-section" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">
                Explore Projects <FiArrowRight size={16} />
              </Link>
              <ResumeLink />
            </div>
            {socials.length > 0 && <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 md:justify-start">
              {socials.map(({ label, icon: Icon, href }) => (
                <a key={label} href={href} target={label === 'Email' ? undefined : '_blank'} rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm hero-social text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">
                  <Icon size={21} aria-hidden="true" />{label}
                </a>
              ))}
            </div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="order-1 mx-auto w-48 sm:w-60 md:order-2 md:mr-0 md:w-full md:max-w-[360px]">
            <div className="hero-portrait aspect-square overflow-hidden rounded-full">
              <img src={settings.profile_photo ? getSafeUrl(settings.profile_photo) : '/profile.webp'} alt={name}
                className="h-full w-full object-cover"
                style={{ objectPosition: settings.profile_photo ? 'center' : 'right' }}
                fetchPriority="high"
                onError={event => {
                  if (event.currentTarget.getAttribute('src') === '/profile.webp') return;
                  event.currentTarget.src = '/profile.webp';
                  event.currentTarget.style.objectPosition = 'right';
                }} />
            </div>
          </motion.div>
        </div>
        <div className="site-container mt-9 lg:mt-12">
          <Link to="/#projects-section" className="scroll-cue inline-flex min-h-11 items-center gap-2 text-sm">
            <FiArrowDown size={16} aria-hidden="true" /> See my work
          </Link>
        </div>
      </main>

      {/* ── 2. About Section (#about-section) ── */}
      <div>
        <About />
      </div>

      {/* ── 3. Projects Section (#projects-section) ── */}
      <Projects limit={2} />

      {/* ── 4. Skills Section (#skills-section) ── */}
      <Skills />

      {/* ── 5. Education & Certifications (#experience-section) ── */}
      <Experience />

      {/* ── 6. Hybrid Blog Preview (#blog-preview-section) ── */}
      <RecentBlogs />

      {/* ── 7. Contact Section (#contact-section) ── */}
      <Contact />
    </div>
  );
}
