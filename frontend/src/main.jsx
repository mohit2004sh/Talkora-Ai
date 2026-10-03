import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Lightbulb,
  Mail,
  Mic,
  Play,
  RefreshCw,
  Shuffle,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Video,
  Volume2,
} from 'lucide-react';
import './styles.css';

const TOPICS = [
  'Should people work four days a week?',
  'What makes a good leader?',
  'Is artificial intelligence good for students?',
  'Describe a place you would love to visit.',
  'Does social media improve communication?',
  'What skill should every student learn?',
  'Is technology making life easier?',
  'What makes a great friend?',
];

const SCORE_ITEMS = [
  ['Fluency', 72, 'blue'],
  ['Grammar', 81, 'green'],
  ['Vocabulary', 74, 'purple'],
  ['Pronunciation', 71, 'cyan'],
  ['Structure', 79, 'orange'],
  ['Delivery', 78, 'pink'],
];

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [attempt, setAttempt] = useState(76);

  const API_BASE = '';

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Session expired');

        const currentUser = await response.json();
        setUser(currentUser);
        localStorage.setItem('talkora_user', JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('talkora_user');
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('auth-open', authOpen);
    return () => document.body.classList.remove('auth-open');
  }, [authOpen]);

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthOpen(true);
  };

  const handleAuth = async (event) => {
  event.preventDefault();
  setAuthError('');
  setAuthLoading(true);

  const form = new FormData(event.currentTarget);

  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const name = String(form.get('name') || '').trim();

  try {
    // SIGNUP
    if (authMode === 'signup') {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Signup failed.'
        );
      }

      // Signup successful → automatically login
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        throw new Error(
          typeof loginData.detail === 'string'
            ? loginData.detail
            : 'Account created, but login failed.'
        );
      }

      localStorage.setItem(
        'access_token',
        loginData.access_token
      );

      localStorage.setItem(
        'talkora_user',
        JSON.stringify(loginData.user)
      );

      setUser(loginData.user);
      setAuthOpen(false);
      return;
    }

    // LOGIN
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof data.detail === 'string'
          ? data.detail
          : 'Login failed.'
      );
    }

    localStorage.setItem(
      'access_token',
      data.access_token
    );

    localStorage.setItem(
      'talkora_user',
      JSON.stringify(data.user)
    );

    setUser(data.user);
    setAuthOpen(false);

  } catch (error) {
    console.error('Authentication error:', error);
    setAuthError(error.message || 'Authentication failed.');
  } finally {
    setAuthLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('talkora_user');
    setUser(null);
  };

  const randomTopic = () => {
    const options = TOPICS.filter((item) => item !== topic);
    setTopic(options[Math.floor(Math.random() * options.length)]);
  };

  const newAttempt = () => {
    setAttempt((value) => Math.min(100, value + 2));
    document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' });
  };

  const chartPoints = useMemo(() => [34, 42, 43, 53, 59, 66, attempt], [attempt]);
  const chartPath = chartPoints
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${index * 75 + 10} ${170 - value * 1.35}`)
    .join(' ');

  if (checkingSession) {
    return (
      <div className="app-shell app-loading">
        <div className="loading-card">
          <div className="brand">Talkora <b>AI</b></div>
          <span>Loading your practice space...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a href="#home" className="brand" aria-label="Talkora AI home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span>Talkora <b>AI</b></span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#analysis">Practice</a>
          <a href="#analysis">Progress</a>
          <a href="#about">About</a>
        </nav>

        <div className="auth-actions">
          {user ? (
            <button className="user-chip" onClick={logout} title="Click to log out">
              <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span>{user.name}</span>
            </button>
          ) : (
            <button className="login-btn" onClick={() => openAuth('login')}>Log in</button>
          )}
        </div>
      </header>

      <main>
        <section id="home" className="hero section-wrap">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} /> AI-POWERED COMMUNICATION COACH</p>
            <h1 className="hero-title">
              <span>Speak better.</span>
              <span>Communicate with</span>
              <span>confidence.</span>
            </h1>
            <p className="hero-description">
              Get a random topic, record a short video, and receive AI-powered feedback on your English, communication and speaking skills.
            </p>
            <button className="primary-btn" onClick={() => document.getElementById('topic-card')?.scrollIntoView({ behavior: 'smooth' })}>
              <Video size={18} /> New Topic <ArrowRight size={18} />
            </button>
          </div>

          <div id="topic-card" className="topic-card glass-card">
            <div className="topic-orb"><Sparkles size={28} /></div>
            <p className="eyebrow">TODAY'S TOPIC</p>
            <h2>{topic}</h2>
            <p>Think about the benefits, challenges and your personal opinion.</p>
            <div className="topic-actions">
              <button className="secondary-btn" onClick={randomTopic}>
                <Shuffle size={16} /> Shuffle topic
              </button>
              <button className="text-btn" onClick={() => setIsRecording(true)}>
                Start practice <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="practice-strip section-wrap">
          <div>
            <span className="mini-label">YOUR NEXT STEP</span>
            <h3>Speak for 1–2 minutes. Don't aim for perfect English.</h3>
            <p>Focus on expressing your idea clearly. Talkora AI will handle the detailed analysis.</p>
          </div>
          <div className={`record-pill ${isRecording ? 'recording' : ''}`}>
            <span className="status-dot" />
            {isRecording ? 'Recording...' : 'Camera & microphone ready'}
            <button onClick={() => setIsRecording((value) => !value)} aria-label="Toggle recording">
              {isRecording ? <span className="stop-square" /> : <Mic size={18} />}
            </button>
          </div>
        </section>

        <section id="analysis" className="analysis section-wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR ANALYSIS</span>
              <h2>See your progress, in detail.</h2>
              <p>Clear scores, detailed feedback and a record of how your communication changes over time.</p>
            </div>
            <button className="secondary-btn" onClick={newAttempt}><RefreshCw size={16} /> Practice again</button>
          </div>

          <div className="dashboard-grid">
            <div className="score-card glass-card">
              <div className="score-ring" style={{ '--score': `${attempt * 3.6}deg` }}>
                <div><strong>{attempt}</strong><span>/100</span></div>
              </div>
              <div className="score-copy">
                <span className="score-badge">Communication score</span>
                <h3>You're building a strong base.</h3>
                <p>Keep practicing with different topics to make your speaking more natural and consistent.</p>
              </div>
            </div>

            <div className="metrics-grid">
              {SCORE_ITEMS.map(([label, score, tone]) => (
                <div className="metric-card" key={label}>
                  <div className={`metric-icon ${tone}`}>
                    {label === 'Fluency' && <Volume2 size={18} />}
                    {label === 'Grammar' && <Check size={18} />}
                    {label === 'Vocabulary' && <Sparkles size={18} />}
                    {label === 'Pronunciation' && <Mic size={18} />}
                    {label === 'Structure' && <Target size={18} />}
                    {label === 'Delivery' && <User size={18} />}
                  </div>
                  <div className="metric-info">
                    <div><span>{label}</span><strong>{score}<small>/100</small></strong></div>
                    <div className="progress-track"><span style={{ width: `${score}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-card glass-card">
              <div className="card-heading"><div><h3>Your progress</h3><p>Last 7 attempts</p></div><TrendingUp size={20} /></div>
              <svg className="progress-chart" viewBox="0 0 460 190" preserveAspectRatio="none" aria-label="Progress chart">
                <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopOpacity=".20"/><stop offset="100%" stopOpacity="0"/></linearGradient></defs>
                {[35, 80, 125, 170].map((y) => <line key={y} x1="10" x2="460" y1={y} y2={y} className="grid-line" />)}
                <path d={`${chartPath} L 460 190 L 10 190 Z`} className="chart-area" />
                <path d={chartPath} className="chart-line" />
                {chartPoints.map((value, index) => <circle key={index} cx={index * 75 + 10} cy={170 - value * 1.35} r="4" className="chart-dot" />)}
              </svg>
              <div className="chart-labels">{['Apr 20','Apr 21','Apr 22','Apr 23','Apr 24','Apr 25','Today'].map((label) => <span key={label}>{label}</span>)}</div>
            </div>

            <div className="transcript-card glass-card">
              <div className="card-heading"><div><h3>Transcript & errors</h3><p>01:24 speaking time</p></div><Play size={18} /></div>
              <p className="transcript-text">Today I want to talk about the importance of technology in our daily life. I think technology is very useful because it make our life easier and faster.</p>
              <div className="errors">
                <div><span>00:32</span><b>“make” → “makes”</b><small>Grammar · Verb form</small></div>
                <div><span>00:48</span><b>“all over the world” → “around the world”</b><small>Vocabulary · More natural phrasing</small></div>
                <div><span>01:03</span><b>Missing article → add “the”</b><small>Grammar · Article usage</small></div>
              </div>
            </div>

            <div className="feedback-card glass-card">
              <div className="card-heading"><div><h3>AI feedback</h3><p>Three things to work on</p></div><Lightbulb size={20} /></div>
              <Feedback number="1" title="Improve fluency">You used 6 filler words and 3 long pauses. Try maintaining a steady pace.</Feedback>
              <Feedback number="2" title="Expand vocabulary">You repeated “very” several times. Try more specific adjectives.</Feedback>
              <Feedback number="3" title="Strengthen structure">Your answer has a clear idea. Add a concrete example to make it more complete.</Feedback>
              <button className="practice-again" onClick={newAttempt}>Try the same topic again <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>
      </main>

      {authOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(e) => e.target === e.currentTarget && setAuthOpen(false)}>
          <div className="auth-modal">
            <button className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close">×</button>
            <div className="auth-logo">Talkora <b>AI</b></div>
            <span className="eyebrow">YOUR PRACTICE SPACE</span>
            <h2 id="auth-title">{authMode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2>
            <p>Save your practice history, scores and progress across sessions.</p>
            <form onSubmit={handleAuth} className="auth-form">
              {authMode === 'signup' && (
                <label>
                  Name
                  <input name="name" type="text" placeholder="Your name" required />
                </label>
              )}
              <label>
                Email
                <input name="email" type="email" placeholder="you@example.com" required />
              </label>
              <label>
                Password
                <input name="password" type="password" placeholder="••••••••" minLength="6" required />
              </label>
              {authError && <div className="auth-error" role="alert">{authError}</div>}
              <button className="primary-btn auth-submit" type="submit" disabled={authLoading}>
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Log in' : 'Create account'}
                {!authLoading && <ArrowRight size={17} />}
              </button>
            </form>
            <button className="auth-switch" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
              {authMode === 'login' ? 'New to Talkora AI? Create an account' : 'Already have an account? Log in'}
            </button>
            <small className="auth-note">Your account and session are authenticated by the Talkora AI backend.</small>
          </div>
        </div>
      )}


      <style>{`
        .app-shell, .app-shell * {
          text-shadow: none !important;
          transform-style: flat !important;
        }

        .brand, .hero-title, .hero-title span, .auth-logo,
        .auth-modal h2, .topic-card h2, .section-heading h2 {
          text-shadow: none !important;
          transform: none !important;
        }

        .auth-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 9999 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 28px 18px !important;
          box-sizing: border-box !important;
          align-items: flex-start !important;
        }

        .auth-modal {
          width: min(100%, 460px) !important;
          max-height: calc(100dvh - 56px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          margin: auto !important;
          box-sizing: border-box !important;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .auth-header { margin-bottom: 20px; }
        .auth-form { display: grid; gap: 15px; }
        .auth-form label { display: grid; gap: 7px; }
        .auth-form input { width: 100%; box-sizing: border-box; }
        .auth-submit { width: 100%; justify-content: center; }
        .auth-submit:disabled { opacity: .65; cursor: wait; }
        .auth-note { display: block; line-height: 1.5; margin-top: 14px; }
        body.auth-open { overflow: hidden; }

        .app-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
        }

        .loading-card {
          display: grid;
          gap: 8px;
          text-align: center;
          padding: 28px;
        }
      `}</style>

      <footer id="about" className="footer">
        <div className="section-wrap footer-grid">
          <div className="footer-brand">
            <a href="#home" className="brand"><span className="brand-mark"><i /><i /><i /><i /><i /></span><span>Talkora <b>AI</b></span></a>
            <p>Talkora AI helps you improve English and communication skills through real practice, personalized feedback and measurable progress.</p>
          </div>
          <div><h4>Quick links</h4><a href="#home">Home</a><a href="#analysis">Practice</a><a href="#analysis">Progress</a><a href="#about">About</a></div>
          <div><h4>About me</h4><p>Built with care to help people speak with more clarity and confidence.</p><a href="#about">Learn more <ArrowRight size={14} /></a></div>
          <div><h4>Contact</h4><a href="mailto:hello@talkora.ai"><Mail size={14} /> hello@talkora.ai</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></div>
        </div>
        <div className="section-wrap footer-bottom"><span>© 2026 Talkora AI. All rights reserved.</span><div><a href="#home">Privacy Policy</a><a href="#home">Terms of Service</a></div></div>
      </footer>
    </div>
  );
}

function Feedback({ number, title, children }) {
  return <div className="feedback-item"><span className="feedback-number">{number}</span><div><strong>{title}</strong><p>{children}</p></div></div>;
}

createRoot(document.getElementById('root')).render(<App />);
