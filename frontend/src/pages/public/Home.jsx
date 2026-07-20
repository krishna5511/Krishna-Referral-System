import { Link } from 'react-router-dom';
import { Share2, Trophy, CreditCard, Bell, Shield, Star, Users, ArrowRight, Check } from 'lucide-react';

function GithubIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function MailIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function Feature({ icon: Icon, title, description, color }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorMap[color].split(' ').slice(1).join(' ')}`}>
        <Icon className={`w-6 h-6`} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">RefSystem</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Earn rewards for every referral
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            Refer Friends,{' '}
            <span className="gradient-text">Earn Rewards</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join our referral program and earn reward points for every person you bring in. Climb the leaderboard, unlock ambassador levels, and withdraw your earnings directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-base px-8 py-3 rounded-xl inline-flex items-center gap-2">
              Start Earning <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3 rounded-xl inline-flex items-center gap-2">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center text-white">
          {[
            { value: '100+', label: 'Points per Referral' },
            { value: '4', label: 'Ambassador Levels' },
            { value: '₹1/pt', label: 'Withdrawal Rate' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold">{value}</p>
              <p className="text-indigo-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need</h2>
            <p className="text-slate-600 dark:text-slate-400">A complete platform to manage your referral journey</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature icon={Share2} title="Referral Links" description="Get a unique referral link to share with friends across any platform." color="indigo" />
            <Feature icon={Trophy} title="Leaderboard" description="Compete with other ambassadors and climb the global leaderboard." color="amber" />
            <Feature icon={CreditCard} title="Withdrawals" description="Withdraw your earned points as cash via UPI or bank transfer." color="emerald" />
            <Feature icon={Bell} title="Notifications" description="Stay updated with real-time notifications for every referral and reward." color="purple" />
          </div>
        </div>
      </section>

      {/* Ambassador Levels */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ambassador Levels</h2>
            <p className="text-slate-600 dark:text-slate-400">Level up as you refer more people</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { level: 'BRONZE', emoji: '🥉', color: 'from-orange-400 to-orange-500' },
              { level: 'SILVER', emoji: '🥈', color: 'from-slate-400 to-slate-500' },
              { level: 'GOLD', emoji: '🥇', color: 'from-yellow-400 to-yellow-500' },
              { level: 'PLATINUM', emoji: '💎', color: 'from-purple-400 to-purple-600' },
            ].map(({ level, emoji, color }) => (
              <div key={level} className={`card text-center bg-gradient-to-br ${color} text-white border-0`}>
                <div className="text-3xl mb-2">{emoji}</div>
                <p className="font-bold">{level}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to start earning?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Join thousands of users already earning rewards through referrals.</p>
          <Link to="/signup" className="btn-primary text-base px-10 py-3 rounded-xl inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <Share2 className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Created by Krishna Jangid
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/krishna5511"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/krishnajangid__07?igsh=dmRmN3A3OTJjaXFv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-500 transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/krishna-jangid-baa236404?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
            <a
              href="mailto:krjangid0123@gmail.com"
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Mail"
            >
              <MailIcon className="w-5 h-5" />
            </a>
          </div>

          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Krishna Jangid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
