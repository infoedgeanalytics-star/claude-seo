/* ─────────────────────────────────────────────────────────────
   data.js  —  Default content + localStorage persistence
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'authorProfileData';

const DEFAULT_DATA = {
  profile: {
    name:           'Priya Sharma',
    eyebrow:        'Career Expert',
    title:          'Senior Career Advisor & Resume Expert',
    company:        'Naukri360',
    bio:            'With 12+ years in HR, talent acquisition, and career coaching, Priya has helped over 50,000 professionals across India craft winning resumes and land jobs at top companies including TCS, Infosys, Accenture, and HDFC Bank. She specialises in ATS-optimised resume writing, interview preparation, and navigating India\'s competitive job market.',
    avatarInitials: 'PS',
    avatarImage:    '',
    stats: [
      { value: '200+',  label: 'Articles'     },
      { value: '12 yrs',label: 'Experience'   },
      { value: '50K+',  label: 'Helped'       },
      { value: '2.4M',  label: 'Total Reads'  },
      { value: '4.9 ★', label: 'Rating'       }
    ]
  },

  social: [
    { id: 1, label: 'LinkedIn', url: '#',                         icon: 'linkedin' },
    { id: 2, label: 'Twitter',  url: '#',                         icon: 'twitter'  },
    { id: 3, label: 'Contact',  url: 'mailto:priya@naukri360.com',icon: 'email'    },
    { id: 4, label: 'RSS Feed', url: '#',                         icon: 'rss'      }
  ],

  expertise: [
    'Resume Writing','ATS Optimisation','Interview Prep',
    'Job Search Strategy','LinkedIn Optimisation','Career Switching','Salary Negotiation'
  ],

  articles: [
    {
      id: 1, featured: true,
      title:    'The Complete ATS Resume Guide for Indian Job Seekers in 2026',
      category: 'Resume Tips',
      date:     '2026-05-28', dateLabel: 'May 28, 2026',
      excerpt:  '87% of large Indian companies now use Applicant Tracking Systems before a human ever sees your resume. Here\'s exactly how to format yours to pass every filter — with section-by-section examples from real Naukri data.',
      readTime: '12 min read',
      emoji:    '📄',
      thumbBg:  'linear-gradient(135deg,#eef0ff 0%,#dde0ff 100%)',
      badge: 'Featured', badgeStyle: 'gold',
      url: '#'
    },
    {
      id: 2, featured: false,
      title:    '30 Most Common HR Interview Questions (With Winning Answers)',
      category: 'Interview Prep',
      date:     '2026-05-20', dateLabel: 'May 20, 2026',
      excerpt:  'Master the questions every Indian recruiter asks in the first round, with proven answer frameworks that turn nervousness into confidence.',
      readTime: '9 min read',
      emoji:    '🎯',
      thumbBg:  'linear-gradient(135deg,#fff0f0 0%,#ffe4e4 100%)',
      badge: '', badgeStyle: '',
      url: '#'
    },
    {
      id: 3, featured: false,
      title:    'How to Switch Careers at 30 in India Without Starting Over',
      category: 'Career Growth',
      date:     '2026-05-14', dateLabel: 'May 14, 2026',
      excerpt:  'A practical playbook for mid-career professionals who want to pivot without taking a pay cut or losing years of seniority.',
      readTime: '8 min read',
      emoji:    '💼',
      thumbBg:  'linear-gradient(135deg,#f0fff4 0%,#dcfce7 100%)',
      badge: '', badgeStyle: '',
      url: '#'
    },
    {
      id: 4, featured: false,
      title:    'Salary Negotiation Scripts That Earned Indians ₹2–5L More',
      category: 'Salary',
      date:     '2026-05-08', dateLabel: 'May 8, 2026',
      excerpt:  'Word-for-word scripts for negotiating your offer, backed by 10,000+ Naukri salary reports and real hiring manager perspectives.',
      readTime: '7 min read',
      emoji:    '💰',
      thumbBg:  'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)',
      badge: '', badgeStyle: '',
      url: '#'
    },
    {
      id: 5, featured: false,
      title:    'LinkedIn Profile Optimisation: The 2026 Checklist for Indian Professionals',
      category: 'Job Search',
      date:     '2026-04-30', dateLabel: 'Apr 30, 2026',
      excerpt:  'Recruiters spend 11 seconds on your LinkedIn. This checklist fixes every signal costing you visibility in search results.',
      readTime: '10 min read',
      emoji:    '🔗',
      thumbBg:  'linear-gradient(135deg,#f0f4ff 0%,#e0e7ff 100%)',
      badge: '', badgeStyle: '',
      url: '#'
    },
    {
      id: 6, featured: false,
      title:    'Resume Summary vs Objective: Which One Should You Use in 2026?',
      category: 'Resume Tips',
      date:     '2026-04-22', dateLabel: 'Apr 22, 2026',
      excerpt:  'The objective isn\'t dead — but only one type of candidate should use it. Here\'s the decision tree that makes it instantly obvious.',
      readTime: '5 min read',
      emoji:    '✍️',
      thumbBg:  'linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%)',
      badge: '', badgeStyle: '',
      url: '#'
    }
  ],

  credentials: [
    { id: 1, icon: '🎓', name: 'MBA – HR & OB',         detail: 'IIM Calcutta · 2013'                  },
    { id: 2, icon: '🏅', name: 'SHRM-CP Certified',     detail: 'Society for Human Resource Mgmt'      },
    { id: 3, icon: '💼', name: 'Ex-Senior HR Manager',  detail: 'Infosys · 6 years'                    },
    { id: 4, icon: '🏢', name: 'Ex-Talent Partner',     detail: 'Deloitte India · 4 years'             }
  ],

  sidebarStats: [
    { value: '200+', label: 'Articles Published'    },
    { value: '2.4M', label: 'Total Reads'           },
    { value: '50K',  label: 'Professionals Helped'  },
    { value: '4.9★', label: 'Average Rating'        }
  ],

  topics: [
    { id: 1, name: 'ATS Resume Writing',  count: '48 articles' },
    { id: 2, name: 'Interview Questions', count: '35 articles' },
    { id: 3, name: 'Career Switching',    count: '27 articles' },
    { id: 4, name: 'LinkedIn Tips',       count: '22 articles' },
    { id: 5, name: 'Salary Negotiation',  count: '18 articles' },
    { id: 6, name: 'Fresher Job Tips',    count: '15 articles' }
  ],

  cta: {
    icon:  '✨',
    title: 'Build Your Resume with AI',
    desc:  'Get a job-winning resume in 10 minutes using Naukri360\'s AI-powered builder — trusted by 70M+ professionals.',
    label: 'Try Free Now',
    url:   '#'
  },

  publications: [
    {
      id: 1, iconClass: 'purple', emoji: '📊',
      title: 'India Resume Benchmarks 2026: What Recruiters Actually Want',
      desc:  'Analysis of 500,000+ Naukri profiles revealing exactly what gets resumes shortlisted — section by section, industry by industry.',
      date: '2026-03-15', dateLabel: 'March 2026',
      meta: 'Deep Dive · 25 min read',
      url: '#'
    },
    {
      id: 2, iconClass: 'blue', emoji: '🎯',
      title: 'The Complete Job Interview Handbook for Indian Professionals',
      desc:  '200-page guide covering every interview type — HR rounds, technical panels, case studies, and C-suite meetings — with real scripts.',
      date: '2026-01-20', dateLabel: 'January 2026',
      meta: 'Free Download',
      url: '#'
    },
    {
      id: 3, iconClass: 'green', emoji: '💡',
      title: 'Career Pivot Playbook: 1,000 Indians Who Changed Industries Successfully',
      desc:  'Case studies, failure patterns, and step-by-step transition frameworks from real professionals who made successful mid-career pivots.',
      date: '2025-11-10', dateLabel: 'November 2025',
      meta: 'Research · 18 min read',
      url: '#'
    }
  ],

  testimonials: [
    {
      id: 1, avatarInitial: 'R', avatarColor: 'c1',
      quote: 'Priya\'s ATS guide was the single most useful thing I read during my job search. Got 4 interview calls in 2 weeks after fixing my resume using her checklist.',
      name: 'Rahul Verma', role: 'Software Engineer at Infosys'
    },
    {
      id: 2, avatarInitial: 'A', avatarColor: 'c2',
      quote: 'After following Priya\'s career switching framework, I moved from operations to product management within 8 months without any pay cut.',
      name: 'Ananya Iyer', role: 'Product Manager at Zomato'
    },
    {
      id: 3, avatarInitial: 'K', avatarColor: 'c3',
      quote: 'The salary negotiation script helped me get ₹3.2L more than the initial offer. I was terrified to negotiate before — now I know exactly what to say.',
      name: 'Karan Malhotra', role: 'Finance Analyst at HDFC Bank'
    }
  ],

  relatedAuthors: [
    { id: 1, initial: 'R', color: 'c1', name: 'Rajesh Iyer',   title: 'Senior HR Practitioner & BFSI Hiring Specialist', articles: '68 articles', url: '#' },
    { id: 2, initial: 'M', color: 'c2', name: 'Meera Kapoor',  title: 'Tech Recruiter & LinkedIn Optimisation Expert',    articles: '54 articles', url: '#' },
    { id: 3, initial: 'V', color: 'c3', name: 'Vivek Rathore', title: 'Career Coach, IIT & MBA Campus Placements',        articles: '91 articles', url: '#' },
    { id: 4, initial: 'S', color: 'c4', name: 'Sunita Gupta',  title: 'Government Jobs & PSU Exam Strategist',            articles: '47 articles', url: '#' }
  ]
};

/* ── Load / Save ── */
function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep clone
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
