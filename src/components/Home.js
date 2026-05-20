import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiHeadphones,
  FiHelpCircle,
  FiLayers,
  FiLock,
  FiLogOut,
  FiMail,
  FiMenu,
  FiMonitor,
  FiPhone,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiZap,
} from 'react-icons/fi';
import { FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';

const stats = [
  { value: '100+', label: 'Clients', icon: FiUsers },
  { value: '24/7', label: 'Operations', icon: FiClock },
  { value: '99%', label: 'Satisfaction', icon: FiCheckCircle },
  { value: 'IT', label: 'Specialists', icon: FiMonitor },
];

const services = [
  { title: 'IT Support', icon: FiMonitor, desc: 'Incident triage, troubleshooting, and escalation coverage.' },
  { title: 'Ticket Management', icon: FiBarChart2, desc: 'Structured queues, assignment workflows, and SLA governance.' },
  { title: 'Outsourcing Solutions', icon: FiLayers, desc: 'Scalable staffing for long-term support and peak operations.' },
  { title: 'Remote Technical Assistance', icon: FiHelpCircle, desc: 'Guided support with resolution playbooks and remote workflows.' },
  { title: 'Employee Support', icon: FiUsers, desc: 'Reliable internal helpdesk for HR, IT, and business applications.' },
  { title: 'Business Operations', icon: FiBriefcase, desc: 'Operational continuity with measurable enterprise support KPIs.' },
];

const whyChoose = [
  { label: 'Fast response times', icon: FiZap },
  { label: 'Enterprise-grade support', icon: FiCheckCircle },
  { label: 'Secure infrastructure', icon: FiLock },
  { label: 'Scalable operations', icon: FiTrendingUp },
  { label: 'Professional support teams', icon: FiHeadphones },
  { label: 'Real-time issue tracking', icon: FiBarChart2 },
];

function Home() {
  const { currentUser, userRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isIT = userRole === 'it';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#0F172A] text-[#F8FAFC] font-['Inter']">
      <img
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
        alt="Enterprise support collaboration"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.9),rgba(15,23,42,0.86),rgba(8,47,73,0.82))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.22),transparent_30%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/35 backdrop-blur-2xl"
        >
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/home" className="flex items-center gap-3" aria-label="ResolveDesk Home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20">
                RD
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.26em]">ResolveDesk</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to={currentUser ? (isIT ? '/dashboard' : '/create-ticket') : '/login'}
                className={`hidden rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 md:inline-flex ${
                  isIT
                    ? 'border border-emerald-300/35 bg-emerald-500/85 hover:bg-emerald-400'
                    : 'border border-amber-300/35 bg-amber-500/90 hover:bg-amber-400'
                }`}
              >
                {currentUser ? (isIT ? 'Dashboard' : 'Create a Ticket') : 'Login'}
              </Link>
              {currentUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 md:inline-flex"
                >
                  <FiLogOut className="mr-2" /> Sign Out
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 md:hidden"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="border-t border-white/10 bg-slate-950/80 p-4 md:hidden">
              <div className="flex flex-col gap-3 text-sm">
                <Link
                  to={currentUser ? (isIT ? '/dashboard' : '/create-ticket') : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {currentUser ? (isIT ? 'Dashboard' : 'Create a Ticket') : 'Login'}
                </Link>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-white/90 hover:text-white"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.header>

        <main id="home" className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 sm:px-6 lg:grid-rows-[auto_auto_1fr_auto] lg:px-8 lg:py-5">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl lg:p-6"
          >
            <h1 className="max-w-4xl text-2xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Enterprise IT and BPO Solutions Built for Modern Businesses
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-200 sm:text-base">
              ResolveDesk empowers organizations with world-class customer support, IT helpdesk
              management, technical operations, and scalable outsourcing solutions.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={currentUser ? (isIT ? '/dashboard' : '/create-ticket') : '/login'}
                className="rounded-full bg-gradient-to-r from-[#06B6D4] to-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Get Started
              </Link>
              <Link
                to="/tickets"
                className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Contact Support
              </Link>
            </div>
          </motion.section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Company statistics">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/12 to-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200">
                    <Icon />
                  </div>
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                </motion.article>
              );
            })}
          </section>

          <section className="grid min-h-0 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid content-start gap-3">
              <article className="rounded-2xl border border-white/12 bg-[#111827]/70 p-4 backdrop-blur-xl">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Company Overview</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Mission: deliver secure, measurable, high-availability helpdesk and BPO support for enterprise teams.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                  {['24/7 Support', 'IT Helpdesk', 'Technical Support', 'Customer Service', 'HR Support', 'BPO Operations', 'SLA Management'].map((capability) => (
                    <span key={capability} className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                      {capability}
                    </span>
                  ))}
                </div>
              </article>

              <article id="services" className="rounded-2xl border border-white/12 bg-[#1E293B]/80 p-4 backdrop-blur-xl">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Services</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <motion.div
                        key={service.title}
                        whileHover={{ y: -2 }}
                        className="rounded-xl border border-white/10 bg-white/8 p-3"
                      >
                        <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200">
                          <Icon className="text-sm" />
                        </div>
                        <h3 className="text-sm font-semibold">{service.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-300">{service.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </article>
            </div>

            <article className="rounded-2xl border border-white/12 bg-[#111827]/70 p-4 backdrop-blur-xl">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Why Choose ResolveDesk</h2>
              <ul className="mt-3 grid gap-2">
                {whyChoose.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 text-sm">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Icon className="text-sm" />
                      </span>
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </article>
          </section>

          <footer
            id="contact"
            className="grid gap-3 rounded-2xl border border-white/12 bg-slate-950/50 px-4 py-3 text-xs text-slate-300 backdrop-blur-xl sm:grid-cols-3"
          >
            <div>
              <p className="font-semibold text-white">ResolveDesk</p>
              <p className="mt-1">Premium BPO and IT Helpdesk Solutions</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:jcgatus.student@ua.edu.ph" className="inline-flex items-center gap-2 hover:text-cyan-300">
                <FiMail /> jcgatus.student@ua.edu.ph
              </a>
              <span className="inline-flex items-center gap-2">
                <FiPhone /> +639757231318
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:gap-3">
              <div className="flex items-center gap-2">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-lg border border-white/20 bg-white/10 p-2 hover:bg-white/15">
                  <FaLinkedinIn />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="rounded-lg border border-white/20 bg-white/10 p-2 hover:bg-white/15">
                  <FaXTwitter />
                </a>
              </div>
              <span>v1.0.0</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Home;
