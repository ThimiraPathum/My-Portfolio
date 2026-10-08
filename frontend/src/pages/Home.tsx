import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
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
  const description = settings.home_description ?? 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.';
  const socials = [
    { label: 'GitHub', icon: FiGithub, href: settings.social_github },
    { label: 'LinkedIn', icon: FiLinkedin, href: settings.social_linkedin },
    { label: 'Email', icon: FiMail, href: settings.social_email ? `mailto:${settings.social_email}` : '' },
  ].filter(social => social.href);

  if (isLoading) return null;

  return (
    <div className="relative">
      <main id="home-section" className="px-5 pb-16 pt-28 sm:px-8 lg:flex lg:min-h-[90svh] lg:items-center lg:py-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-9 md:grid-cols-[1.25fr_1fr] md:gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="order-2 min-w-0 text-center md:order-1 md:text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Hello, I'm</p>
            <h1 className="mb-6 text-[3.25rem] font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl break-words"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {firstName}{rest.length > 0 && <><br /><span className="text-orange-700">{rest.join(' ')}</span></>}
            </h1>
            <div className="mx-auto max-w-xl text-base leading-relaxed text-stone-600 md:mx-0 [&_p]:!leading-[1.8] [&_p]:!text-base [&_p]:!text-stone-600">
              <MarkdownRenderer content={description} />
            </div>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row md:justify-start">
              <Link to="/#projects-section" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">
                Explore Projects <FiArrowRight size={16} />
              </Link>
              <Link to="/#about-section" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-orange-400 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">
                More About Me
              </Link>
            </div>
            {socials.length > 0 && <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 md:justify-start">
              {socials.map(({ label, icon: Icon, href }) => (
                <a key={label} href={href} target={label === 'Email' ? undefined : '_blank'} rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-stone-600 transition-colors hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">
                  <Icon size={16} aria-hidden="true" />{label}
                </a>
              ))}
            </div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="order-1 mx-auto w-44 sm:w-56 md:order-2 md:w-full md:max-w-[320px]">
            <div className="aspect-square overflow-hidden rounded-full">
              <img src={settings.profile_photo ? getSafeUrl(settings.profile_photo) : '/profile.jpg'} alt={name}
                className="h-full w-full object-cover"
                style={{ objectPosition: settings.profile_photo ? 'center' : 'right' }}
                fetchPriority="high"
                onError={event => {
                  if (event.currentTarget.getAttribute('src') === '/profile.jpg') return;
                  event.currentTarget.src = '/profile.jpg';
                  event.currentTarget.style.objectPosition = 'right';
                }} />
            </div>
          </motion.div>
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
