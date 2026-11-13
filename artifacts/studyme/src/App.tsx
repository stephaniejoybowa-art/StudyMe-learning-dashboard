import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import {
  ArrowLeft, ArrowRight, Award, BookOpenCheck, Check, CheckCircle2,
  CircleHelp, Clock3, Compass, GraduationCap, Layers3, Menu, RotateCcw, Settings,
  Sparkles, Target, Trophy, X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { educationLevels, modules, subjects, type EducationLevel, type Module, type Question, type Subject } from '@/data/curriculum';

type AchievementToken = { id: string; moduleId: string; subjectId: string; title: string; kind: 'module' | 'quiz'; points: number; earnedAt: string };
type Progress = { learnerName: string; educationLevelId: string; completedModuleIds: string[]; quizBestScores: Record<string, number>; earnedTokens: AchievementToken[] };
type StudyContextValue = { progress: Progress; update: (patch: Partial<Progress>) => void; reset: () => void };

const STORAGE_KEY = 'studyme-progress-v1';
const initialProgress: Progress = { learnerName: 'Alex', educationLevelId: 'lifelong', completedModuleIds: [], quizBestScores: {}, earnedTokens: [] };
const StudyContext = createContext<StudyContextValue | null>(null);
const useStudy = () => {
  const value = useContext(StudyContext);
  if (!value) throw new Error('StudyMe context is missing');
  return value;
};

function Provider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialProgress, ...JSON.parse(saved) } : initialProgress;
    } catch { return initialProgress; }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }, [progress]);
  const update = (patch: Partial<Progress>) => setProgress((current) => ({ ...current, ...patch }));
  const reset = () => { setProgress(initialProgress); localStorage.removeItem(STORAGE_KEY); };
  return <StudyContext.Provider value={{ progress, update, reset }}>{children}</StudyContext.Provider>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function levelFor(id: string): EducationLevel {
  return educationLevels.find((level) => level.id === id) ?? educationLevels[7];
}
function subjectFor(id: string): Subject | undefined { return subjects.find((subject) => subject.id === id); }
function moduleFor(id: string): Module | undefined { return modules.find((item) => item.id === id); }
function cx(...classes: Array<string | false | undefined>) { return classes.filter(Boolean).join(' '); }

function AppShell() {
  const { progress } = useStudy();
  const level = levelFor(progress.educationLevelId);
  const [mobileMenu, setMobileMenu] = useState(false);
  const nav = [
    { href: '/', label: 'My learning', icon: Compass },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
  return (
    <div className="min-h-[100dvh] bg-[#f6f5f9] text-[#29253a]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#302a47] px-5 py-6 text-white md:flex">
        <Link href="/" className="mb-10 flex items-center gap-3 px-2" data-testid="link-brand-home">
          <img src="/studyme-logo.png" alt="StudyMe" className="h-12 w-12 rounded-2xl bg-white object-cover" data-testid="img-studyme-logo" />
          <span className="font-display text-[21px] font-extrabold tracking-[-.06em]">studyme<span className="text-[#f3cb73]">.</span></span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#b7b0ca]">Your space</p>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = window.location.pathname === href || (href === '/' && window.location.pathname.startsWith('/subjects'));
            return <Link key={href} href={href} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={cx('flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold', active ? 'bg-[#49415f] text-white' : 'text-[#c9c4d5] hover:bg-[#3c3554] hover:text-white')}>
              <Icon size={17} strokeWidth={1.9} /><span>{label}</span>{href === '/achievements' && progress.earnedTokens.length > 0 && <span className="ml-auto rounded-full bg-[#f3cb73] px-2 py-0.5 text-[10px] font-bold text-[#302a47]">{progress.earnedTokens.length}</span>}
            </Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#d6d1e0]">Your learning path</span><GraduationCap size={15} className="text-[#d5b7ff]" />
          </div>
          <div className="mb-1 truncate text-sm font-bold" data-testid="text-sidebar-level">{level.label}</div>
          <div className="text-[11px] leading-relaxed text-[#b7b0ca]">{level.ageRange} · chosen by you</div>
          <Link href="/settings" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#e1cfff]" data-testid="link-change-level">Change level <ArrowRight size={13} /></Link>
        </div>
        <div className="mt-5 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4c1f5] text-sm font-extrabold text-[#3a3154]" data-testid="avatar-learner">{progress.learnerName.trim().slice(0,1).toUpperCase() || 'A'}</div>
          <div className="min-w-0"><div className="truncate text-[13px] font-bold" data-testid="text-learner-name">{progress.learnerName || 'Learner'}</div><div className="text-[10px] text-[#c1bbcf]">Learning at your pace</div></div>
        </div>
      </aside>
      <div className="md:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#ebe9ef] bg-[#f8f7fa]/90 px-4 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open navigation" data-testid="button-mobile-menu" className="rounded-xl p-2 text-[#625c73] hover:bg-[#eeebf3] md:hidden">{mobileMenu ? <X size={19} /> : <Menu size={19} />}</button>
            <span className="font-display text-sm font-bold tracking-tight md:hidden">studyme<span className="text-[#9b79cf]">.</span></span>
            <span className="hidden text-[12px] text-[#827d8e] md:inline" data-testid="text-current-level">Learning for <b className="text-[#4c465d]">{level.label}</b></span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#ebe8f0] bg-white px-3 py-2 text-[11px] font-semibold text-[#655e73]" data-testid="status-token-count">
            <Award size={15} className="text-[#b08a43]" /> <span>{progress.earnedTokens.length} tokens</span>
          </div>
        </header>
        {mobileMenu && <div className="fixed inset-x-0 top-[68px] z-30 border-b border-[#e8e4ef] bg-white px-4 py-3 shadow-lg md:hidden">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} onClick={()=>setMobileMenu(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#554d68]" data-testid={`mobile-nav-${label.toLowerCase().replaceAll(' ','-')}`}><Icon size={17}/>{label}</Link>)}</div>}
        <main className="mx-auto min-h-[calc(100dvh-68px)] max-w-[1400px] px-4 py-7 sm:px-7 md:px-10 md:py-9">
          <RoutedErrorBoundary><Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/subjects/:subjectId" component={SubjectPage} />
            <Route path="/modules/:moduleId" component={ModulePage} />
            <Route path="/achievements" component={AchievementsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch></RoutedErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function ProgressBar({ value, testId }: { value: number; testId: string }) {
  return <div className="h-2 overflow-hidden rounded-full bg-[#eeebf2]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} data-testid={testId}><div className="progress-fill h-full rounded-full bg-[#9c7bd0]" style={{ width: `${value}%` }} /></div>;
}

function Dashboard() {
  const { progress } = useStudy();
  const level = levelFor(progress.educationLevelId);
  const completion = Math.round(progress.completedModuleIds.length / modules.length * 100);
  const continueModule = modules.find((item) => !progress.completedModuleIds.includes(item.id)) ?? modules[0];
  const continueSubject = subjectFor(continueModule.subjectId)!;
  return <div className="page-in">
    <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#eee8f7] px-3 py-1.5 text-[11px] font-bold text-[#715a93]" data-testid="badge-education-level"><GraduationCap size={14}/>{level.label}<span className="font-medium text-[#8e80a3]">· {level.ageRange}</span></div>
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-[-.055em] text-[#29253a] sm:text-[40px]" data-testid="text-dashboard-heading">A little learning,<br className="sm:hidden"/> a lot of possibility.</h1>
        <p className="mt-2 max-w-[540px] text-[14px] leading-relaxed text-[#777286]">Welcome back, {progress.learnerName || 'learner'}. Follow a spark of curiosity wherever it takes you.</p>
      </div>
      <Link href={`/modules/${continueModule.id}`} className="group inline-flex min-h-[54px] items-center justify-between gap-5 rounded-2xl bg-[#d8c8f2] px-5 py-3 text-left text-[#352c4d] shadow-[0_5px_14px_rgba(91,67,128,.08)] hover:-translate-y-0.5 sm:min-w-[250px]" data-testid="button-continue-learning">
        <span><span className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#75638f]">{progress.completedModuleIds.length ? 'Pick up where you left off' : 'A good place to begin'}</span><span className="mt-0.5 block text-[14px] font-extrabold">{continueModule.title}</span></span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 group-hover:bg-white"><ArrowRight size={17}/></span>
      </Link>
    </div>
    <div className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_.85fr]">
      <section className="relative overflow-hidden rounded-[24px] bg-[#332b4b] px-6 py-6 text-white sm:px-8 sm:py-7" data-testid="panel-learning-overview">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[1px] border-white/[.08]" /><div className="absolute -right-1 -top-12 h-44 w-44 rounded-full border border-white/[.08]" />
        <div className="relative flex items-start justify-between gap-4">
          <div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#d0c1e9]"><Sparkles size={14}/>Your learning, your way</div><h2 className="mt-3 font-display text-[23px] font-bold tracking-[-.04em]">Curiosity has no finish line.</h2><p className="mt-1 max-w-[390px] text-[12px] leading-relaxed text-[#c9c3d5]">Explore a small idea today. Come back when you’re ready for the next one.</p></div>
          <div className="float-gently hidden h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[28px] bg-[#f1d17c] text-[#453b53] sm:flex"><BookOpenCheck size={34}/></div>
        </div>
        <div className="relative mt-7 flex items-end justify-between gap-5">
          <div className="w-full max-w-[370px]"><div className="mb-2 flex items-center justify-between text-[11px]"><span className="text-[#d3cde0]">Your module journey</span><span className="font-bold text-white">{progress.completedModuleIds.length} / {modules.length}</span></div><ProgressBar value={completion} testId="progress-overall" /><div className="mt-2 text-[10px] text-[#b8b0c8]">{completion}% of this demo library explored</div></div>
          <div className="hidden text-right sm:block"><div className="font-display text-[27px] font-extrabold">{progress.earnedTokens.length}</div><div className="text-[10px] text-[#c9c3d5]">tokens collected</div></div>
        </div>
      </section>
      <section className="flex flex-col justify-between rounded-[24px] border border-[#ebe8ef] bg-white p-6" data-testid="panel-daily-prompt">
        <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8b8498]">A gentle reminder</span><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf1da] text-[#a7833e]"><Target size={17}/></div></div>
        <div className="mt-5"><p className="font-display text-[19px] font-bold leading-snug tracking-[-.035em] text-[#383249]">“You don’t have to know it all. Just start with one thing.”</p><p className="mt-3 text-[11px] text-[#8a8497]">There are {modules.length} bite-sized modules waiting.</p></div>
        <Link href="/achievements" className="mt-5 inline-flex w-fit items-center gap-2 text-[12px] font-bold text-[#8061ad] hover:gap-3" data-testid="link-view-achievements">See your progress <ArrowRight size={14}/></Link>
      </section>
    </div>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#948da0]">Explore the library</p><h2 className="mt-1 font-display text-[23px] font-extrabold tracking-[-.04em]">Choose a subject</h2></div>
      <span className="text-[11px] text-[#8b8497]" data-testid="text-subject-count">{subjects.length} subjects · {modules.length} modules</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject, index) => <SubjectCard key={subject.id} subject={subject} index={index} />)}
    </div>
    <p className="mt-7 text-center text-[10px] leading-relaxed text-[#938da0]" data-testid="text-reward-disclaimer">Tokens are local achievements saved on this device — they are not blockchain NFTs.</p>
  </div>;
}

function SubjectCard({ subject, index }: { subject: Subject; index: number }) {
  const { progress } = useStudy();
  const items = modules.filter((module) => module.subjectId === subject.id);
  const done = items.filter((module) => progress.completedModuleIds.includes(module.id)).length;
  const Icon = subject.icon;
  return <Link href={`/subjects/${subject.id}`} className="group rounded-[20px] border border-[#ebe8ef] bg-white p-5 hover:-translate-y-1 hover:border-[#d8cce9] hover:shadow-[0_12px_28px_rgba(65,50,91,.07)]" data-testid={`card-subject-${subject.id}`}>
    <div className="mb-5 flex items-start justify-between"><div className={cx('flex h-11 w-11 items-center justify-center rounded-[15px]', `tint-${subject.tint}`)}><Icon size={20} strokeWidth={1.8}/></div><span className="rounded-full bg-[#f5f3f7] px-2.5 py-1 text-[10px] font-bold text-[#777184]">{items.length} modules</span></div>
    <h3 className="font-display text-[16px] font-extrabold tracking-[-.025em] text-[#342f44]">{subject.name}</h3><p className="mt-1 text-[11px] leading-relaxed text-[#888295]">{subject.description}</p>
    <div className="mt-5 flex items-center gap-3"><div className="flex-1"><ProgressBar value={items.length ? done / items.length * 100 : 0} testId={`progress-subject-${subject.id}`}/></div><span className="text-[10px] font-bold text-[#8a8497]">{done}/{items.length}</span><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f1f8] text-[#837293] group-hover:bg-[#e8ddf5]"><ArrowRight size={14}/></span></div>
  </Link>;
}

function SubjectPage() {
  const { subjectId = '' } = useParams();
  const subject = subjectFor(subjectId);
  const { progress } = useStudy();
  if (!subject) return <NotFound />;
  const Icon = subject.icon;
  const items = modules.filter((module) => module.subjectId === subjectId);
  return <div className="page-in">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-[12px] font-bold text-[#7b7489] hover:text-[#5a4479]" data-testid="link-back-dashboard"><ArrowLeft size={15}/>All subjects</Link>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className={cx('mb-4 flex h-12 w-12 items-center justify-center rounded-[16px]',`tint-${subject.tint}`)}><Icon size={22}/></div><div className="mb-1 text-[11px] font-bold uppercase tracking-[.15em] text-[#918a9d]">Subject pathway</div><h1 className="font-display text-[34px] font-extrabold tracking-[-.05em]">{subject.name}</h1><p className="mt-1 text-sm text-[#817b8e]">{subject.description}</p></div>
      <div className="rounded-2xl border border-[#ebe8ef] bg-white px-4 py-3 text-[11px] text-[#716b7e]" data-testid="status-subject-stage"><GraduationCap size={15} className="mr-2 inline text-[#9779c1]"/>Content view: <b>{levelFor(progress.educationLevelId).label}</b></div>
    </div>
    <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-extrabold tracking-[-.03em]">Your modules</h2><span className="text-[11px] text-[#888295]">{items.filter((m)=>progress.completedModuleIds.includes(m.id)).length} complete</span></div>
    <div className="space-y-3">{items.map((module, i) => <ModuleRow key={module.id} module={module} index={i} />)}</div>
  </div>;
}

function ModuleRow({ module, index }: { module: Module; index: number }) {
  const { progress } = useStudy();
  const done = progress.completedModuleIds.includes(module.id);
  const score = progress.quizBestScores[module.id];
  return <Link href={`/modules/${module.id}`} className="group flex flex-col gap-4 rounded-[20px] border border-[#ebe8ef] bg-white p-5 hover:border-[#d8cce9] hover:shadow-[0_10px_25px_rgba(65,50,91,.06)] sm:flex-row sm:items-center" data-testid={`card-module-${module.id}`}>
    <div className="flex w-full items-center gap-4 sm:w-auto"><span className="font-display text-[12px] font-extrabold text-[#c0b8ca]">0{index + 1}</span><div className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px]', done ? 'bg-[#e3f2e8] text-[#4c9270]' : 'bg-[#f2eef8] text-[#9075b4]')}>{done ? <Check size={19}/> : <BookOpenCheck size={19}/>}</div><div className="min-w-0 flex-1 sm:min-w-[210px]"><h3 className="font-display text-[14px] font-extrabold tracking-[-.02em]">{module.title}</h3><p className="mt-1 text-[11px] leading-relaxed text-[#858092]">{module.summary}</p></div><ArrowRight size={17} className="ml-auto shrink-0 text-[#a79eaf] group-hover:translate-x-1 group-hover:text-[#8061ad] sm:hidden"/></div>
    <div className="ml-[52px] flex flex-wrap items-center gap-x-5 gap-y-2 sm:ml-auto sm:justify-end"><span className="inline-flex items-center gap-1.5 text-[10px] text-[#858092]"><Clock3 size={13}/>{module.estimatedMinutes} min</span><span className={cx('rounded-full px-2.5 py-1 text-[10px] font-bold', done ? 'bg-[#e5f3e9] text-[#53866a]' : 'bg-[#f4f2f6] text-[#817b8e]')}>{done ? 'Lesson complete' : 'Ready to explore'}</span>{score !== undefined && <span className="text-[10px] font-bold text-[#8d70b5]">Best quiz {score}/3</span>}<ArrowRight size={16} className="hidden text-[#a79eaf] group-hover:translate-x-1 group-hover:text-[#8061ad] sm:block"/></div>
  </Link>;
}

function ModulePage() {
  const { moduleId = '' } = useParams();
  const module = moduleFor(moduleId);
  const { progress, update } = useStudy();
  const [tab, setTab] = useState<'lesson'|'quiz'>('lesson');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  if (!module) return <NotFound />;
  const subject = subjectFor(module.subjectId)!;
  const level = levelFor(progress.educationLevelId);
  const complete = progress.completedModuleIds.includes(module.id);
  const score = module.quiz.reduce((total, q) => total + (answers[q.id] === q.answerIndex ? 1 : 0), 0);
  const existingTokens = progress.earnedTokens;
  const award = (kind: 'module'|'quiz') => {
    const tokenId = `${kind}:${module.id}`;
    const token: AchievementToken = { id: tokenId, moduleId: module.id, subjectId: module.subjectId, title: module.title, kind, points: kind === 'module' ? 10 : 15, earnedAt: new Date().toISOString() };
    update({ earnedTokens: existingTokens.some((item)=>item.id === tokenId) ? existingTokens : [...existingTokens, token] });
  };
  const markComplete = () => {
    if (!complete) update({ completedModuleIds: [...progress.completedModuleIds, module.id] });
    award('module');
  };
  const submitQuiz = () => {
    setSubmitted(true);
    const best = Math.max(progress.quizBestScores[module.id] ?? 0, score);
    update({ quizBestScores: { ...progress.quizBestScores, [module.id]: best } });
    if (score >= 2) award('quiz');
  };
  const startQuiz = () => { setAnswers({}); setSubmitted(false); setTab('quiz'); };
  return <div className="page-in mx-auto max-w-[880px]">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href={`/subjects/${subject.id}`} className="inline-flex items-center gap-2 text-[12px] font-bold text-[#7b7489] hover:text-[#5a4479]" data-testid="link-back-subject"><ArrowLeft size={15}/>{subject.name}</Link>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eee8f7] px-3 py-1.5 text-[10px] font-bold text-[#715a93]" data-testid="badge-module-stage"><GraduationCap size={13}/>{level.label}</span>
    </div>
    <div className="mb-6"><div className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#958ea1]">{subject.name} <span className="px-1.5">/</span> {module.estimatedMinutes} minute module</div><h1 className="font-display text-[32px] font-extrabold leading-tight tracking-[-.05em] sm:text-[40px]" data-testid="text-module-title">{module.title}</h1><p className="mt-2 max-w-[650px] text-[13px] leading-relaxed text-[#7e788b]">{module.summary}</p></div>
    <div className="mb-5 rounded-2xl border border-[#e8e2ef] bg-[#f0ebf7] px-4 py-3 text-[11px] leading-relaxed text-[#6d5c83]" data-testid="text-stage-context"><GraduationCap size={15} className="mr-2 inline"/>This learning space is set to <b>{level.label}</b> ({level.ageRange}). Your choice stays with you as you explore.</div>
    <div className="mb-5 flex gap-2 rounded-2xl bg-[#eeecf1] p-1.5">
      <button onClick={()=>setTab('lesson')} data-testid="tab-lesson" className={cx('flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold',tab==='lesson'?'bg-white text-[#4e4261] shadow-sm':'text-[#858092] hover:text-[#514961]')}><BookOpenCheck size={15}/>Lesson <span className="hidden sm:inline">· {complete?'complete':'read & reflect'}</span></button>
      <button onClick={()=>setTab('quiz')} data-testid="tab-quiz" className={cx('flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold',tab==='quiz'?'bg-white text-[#4e4261] shadow-sm':'text-[#858092] hover:text-[#514961]')}><CircleHelp size={15}/>Quick check <span className="hidden sm:inline">· 3 questions</span></button>
    </div>
    {tab==='lesson' ? <section className="rounded-[22px] border border-[#ebe8ef] bg-white p-5 sm:p-8" data-testid="content-lesson">
      <div className="mb-6 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.15em] text-[#978ea1]">Lesson notes</span><span className="inline-flex items-center gap-1.5 text-[10px] text-[#8a8497]"><Clock3 size={13}/>{module.estimatedMinutes} min</span></div>
      <p className="mb-7 text-[15px] leading-[1.85] text-[#504b5e]" data-testid="text-lesson-introduction">{module.lesson.introduction}</p>
      <div className="space-y-7">{module.lesson.sections.map((section,index)=><div key={section.heading} className="grid gap-2 sm:grid-cols-[130px_1fr]"><h2 className="font-display text-[14px] font-extrabold tracking-[-.02em] text-[#443c57]">{section.heading}</h2><p className="text-[13px] leading-[1.85] text-[#706a7d]" data-testid={`text-lesson-section-${index+1}`}>{section.body}</p></div>)}</div>
      <div className="my-7 rounded-2xl border-l-[3px] border-[#aa8bd2] bg-[#f6f1fb] px-5 py-4"><div className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#8d71b0]">Keep in mind</div><p className="text-[13px] leading-relaxed text-[#5e536e]" data-testid="text-lesson-takeaway">{module.lesson.takeaway}</p></div>
      <div className="flex flex-col justify-between gap-3 border-t border-[#f0edf3] pt-5 sm:flex-row sm:items-center"><span className="text-[11px] text-[#8a8497]">{complete ? 'You’ve completed this lesson. Your token is safe in your collection.' : 'Finish the lesson to collect your first token.'}</span><button onClick={markComplete} data-testid="button-complete-lesson" className={cx('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold',complete?'bg-[#e8f3eb] text-[#4f8467]':'bg-[#8060ae] text-white hover:bg-[#6f509b]')}>{complete?<CheckCircle2 size={15}/>:<Award size={15}/>} {complete?'Lesson complete':'Complete lesson · earn token'}</button></div>
      <button onClick={startQuiz} data-testid="button-start-quiz" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e3ed] py-3 text-[12px] font-bold text-[#655a75] hover:bg-[#faf8fc]">Ready? Take the quick check <ArrowRight size={14}/></button>
    </section> : <Quiz module={module} answers={answers} setAnswers={setAnswers} submitted={submitted} score={score} onSubmit={submitQuiz} onRetry={()=>{setAnswers({});setSubmitted(false);}} best={progress.quizBestScores[module.id]} />}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ebe8ef] bg-white px-5 py-4" data-testid="panel-module-rewards"><span className="inline-flex items-center gap-2 text-[11px] font-bold text-[#716a7f]"><Award size={15} className="text-[#b08a43]"/>Reward shelf</span><span className="text-[10px] text-[#8c8698]">{existingTokens.some(t=>t.id===`module:${module.id}`)?'Lesson token collected':'Lesson token waiting'} <span className="mx-1.5">·</span> {existingTokens.some(t=>t.id===`quiz:${module.id}`)?'Quiz token collected':'Quiz token for a passing score'}</span></div>
  </div>;
}

function Quiz({ module, answers, setAnswers, submitted, score, onSubmit, onRetry, best }: {
  module: Module; answers: Record<string,number>; setAnswers: (next: Record<string,number>)=>void; submitted: boolean; score: number; onSubmit: ()=>void; onRetry: ()=>void; best?: number;
}) {
  const allAnswered = module.quiz.every((q)=>answers[q.id] !== undefined);
  return <section className="rounded-[22px] border border-[#ebe8ef] bg-white p-5 sm:p-8" data-testid="content-quiz">
    <div className="mb-6 flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.15em] text-[#978ea1]">A quick check</div><h2 className="mt-1 font-display text-[22px] font-extrabold tracking-[-.04em]">Three questions. No rush.</h2></div><div className="rounded-xl bg-[#f5f1f9] px-3 py-2 text-[10px] font-bold text-[#8066a2]">Pass with 2 of 3</div></div>
    <div className="space-y-6">{module.quiz.map((q,index)=><QuestionBlock key={q.id} question={q} index={index} selected={answers[q.id]} submitted={submitted} onChoose={(answer)=>setAnswers({...answers,[q.id]:answer})}/>)}</div>
    {submitted && <div className={cx('mt-7 rounded-2xl px-5 py-4',score>=2?'bg-[#eaf4ed] text-[#496e55]':'bg-[#fbf1df] text-[#85693b')} data-testid="status-quiz-result"><div className="flex items-center gap-2 font-display text-[17px] font-extrabold">{score>=2?<CheckCircle2 size={19}/>:<Target size={18}/>}You got {score} of 3</div><p className="mt-1 text-[11px]">{score>=2?'That’s a pass. Your quiz token has been added to your local collection.':'You’re close. Review the explanations, then give it another go.'}</p>{best!==undefined&&<p className="mt-1 text-[10px]">Best score saved: {best}/3</p>}</div>}
    <div className="mt-7 flex flex-col gap-3 border-t border-[#f0edf3] pt-5 sm:flex-row sm:justify-between"><p className="self-center text-[10px] text-[#8c8698]">{submitted?'Your best score is saved on this device.':'Choose an answer for each question to submit.'}</p>{submitted?<button onClick={onRetry} data-testid="button-retry-quiz" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e7e1ec] px-4 py-3 text-[12px] font-bold text-[#665d74] hover:bg-[#faf8fc]"><RotateCcw size={14}/>Try again</button>:<button onClick={onSubmit} disabled={!allAnswered} data-testid="button-submit-quiz" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8060ae] px-5 py-3 text-[12px] font-bold text-white hover:bg-[#6f509b] disabled:cursor-not-allowed disabled:opacity-40">Check answers <ArrowRight size={14}/></button>}</div>
  </section>;
}

function QuestionBlock({ question, index, selected, submitted, onChoose }: { question: Question; index: number; selected?: number; submitted: boolean; onChoose: (answer:number)=>void }) {
  return <fieldset className="border-b border-[#f0edf3] pb-5 last:border-0 last:pb-0" data-testid={`question-${question.id}`}>
    <legend className="mb-3 flex gap-3 text-[13px] font-bold leading-relaxed text-[#443f52]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#f2eef7] text-[10px] text-[#8064a1]">0{index+1}</span>{question.prompt}</legend>
    <div className="space-y-2 pl-9">{question.options.map((option,optionIndex)=>{
      const isCorrect=optionIndex===question.answerIndex; const isSelected=selected===optionIndex;
      return <button type="button" key={option} onClick={()=>!submitted&&onChoose(optionIndex)} disabled={submitted} data-testid={`answer-${question.id}-${optionIndex}`} className={cx('flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[11px] leading-relaxed',submitted&&isCorrect?'border-[#add2b4] bg-[#eef7f0] text-[#476f50]':submitted&&isSelected&&!isCorrect?'border-[#e7b8b4] bg-[#fcf0ef] text-[#975c57]':isSelected?'border-[#b8a0d6] bg-[#f5effc] text-[#57466c]':'border-[#eeebf1] bg-white text-[#6b6577] hover:border-[#cbb8e2] hover:bg-[#fbf9fd]')}><span className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px]',isSelected?'border-[#9875bd] bg-[#9875bd] text-white':'border-[#dad5e0] text-transparent')}>{isSelected?'✓':''}</span><span className="flex-1">{option}</span>{submitted&&isCorrect&&<Check size={14}/>}</button>;
    })}</div>
    {submitted&&<p className="ml-9 mt-2 rounded-lg bg-[#f7f5f9] px-3 py-2 text-[10px] leading-relaxed text-[#706a7a]" data-testid={`text-explanation-${question.id}`}>{question.explanation}</p>}
  </fieldset>;
}

function AchievementsPage() {
  const { progress } = useStudy();
  const points = progress.earnedTokens.reduce((total, token)=>total+token.points,0);
  const possible = modules.length * 2;
  const unlocked = progress.earnedTokens.length;
  return <div className="page-in mx-auto max-w-[1080px]">
    <div className="mb-7"><div className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#8c8499]"><Trophy size={14} className="text-[#b08a43]"/>Your collection</div><h1 className="font-display text-[34px] font-extrabold tracking-[-.05em]" data-testid="text-achievements-heading">Every little win counts.</h1><p className="mt-2 text-[13px] text-[#817b8e]">Tokens mark the moments you show up, explore, and learn.</p></div>
    <div className="mb-7 grid gap-3 sm:grid-cols-[1fr_1fr_1.3fr]">
      <div className="rounded-[20px] bg-[#342d4b] p-5 text-white" data-testid="stat-token-count"><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#cbc1dc]">Tokens collected</div><div className="mt-2 font-display text-[32px] font-extrabold">{unlocked}<span className="ml-1 text-[14px] text-[#c6bfd1]">/ {possible}</span></div></div>
      <div className="rounded-[20px] border border-[#ebe8ef] bg-white p-5" data-testid="stat-points"><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8e879a]">Learning points</div><div className="mt-2 flex items-center gap-2 font-display text-[32px] font-extrabold text-[#554765]">{points}<Sparkles size={20} className="text-[#bd9650]"/></div></div>
      <div className="rounded-[20px] border border-[#ebe8ef] bg-white p-5"><div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em] text-[#8e879a]"><span>Collection progress</span><span>{Math.round(unlocked/possible*100)}%</span></div><ProgressBar value={unlocked/possible*100} testId="progress-token-collection"/><p className="mt-3 text-[10px] leading-relaxed text-[#8d8798]">Complete lessons and pass quick checks to grow your collection.</p></div>
    </div>
    <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-[18px] font-extrabold tracking-[-.03em]">Token shelf</h2><span className="text-[10px] text-[#8e879a]" data-testid="text-token-shelf-count">{unlocked} earned · {possible-unlocked} to discover</span></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{modules.flatMap((module)=>['module','quiz'].map((kind)=>({module,kind:kind as 'module'|'quiz'}))).map(({module,kind})=>{
      const id=`${kind}:${module.id}`; const token=progress.earnedTokens.find((item)=>item.id===id); const subject=subjectFor(module.subjectId)!; const Icon=subject.icon;
      return <div key={id} className={cx('relative overflow-hidden rounded-[18px] border p-4',token?'border-[#e5d9f1] bg-white':'border-dashed border-[#e2dee8] bg-[#f8f7fa]')} data-testid={`token-card-${id.replace(':','-')}`}>
        <div className="flex items-start gap-3"><div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]',token?'bg-[#eee5f7] text-[#8665af]':'bg-[#eeecf1] text-[#aaa4b2]')}><Icon size={18}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#938b9f]">{kind==='module'?'Lesson token':'Quiz token'}</span>{token&&<CheckCircle2 size={13} className="text-[#5a9a70]"/>}</div><h3 className={cx('mt-1 truncate font-display text-[13px] font-extrabold',token?'text-[#443b55]':'text-[#8e8898]')}>{module.title}</h3><p className="mt-1 text-[10px] text-[#938d9c]">{subject.name} · {kind==='module'?'+10':' +15'} points</p></div><div className={cx('rounded-full px-2 py-1 text-[9px] font-bold',token?'bg-[#e9f3eb] text-[#548166]':'bg-[#efedf1] text-[#9892a0]')}>{token?'Earned':'Locked'}</div></div>
        {token&&<div className="mt-3 border-t border-[#f1edf4] pt-2 text-[9px] text-[#a29baa]">Collected {new Date(token.earnedAt).toLocaleDateString()}</div>}
      </div>;
    })}</div>
    <div className="mt-7 rounded-2xl border border-[#ebe8ef] bg-white px-5 py-4 text-[10px] leading-relaxed text-[#827b8e]" data-testid="text-token-disclaimer"><Award size={14} className="mr-2 inline text-[#a8874e]"/>These are local achievement tokens stored in your browser. They are not minted blockchain NFTs.</div>
  </div>;
}

function SettingsPage() {
  const { progress, update, reset } = useStudy();
  const [name, setName] = useState(progress.learnerName);
  const [showReset, setShowReset] = useState(false);
  useEffect(()=>setName(progress.learnerName),[progress.learnerName]);
  const selected=levelFor(progress.educationLevelId);
  const saveName=()=>update({learnerName:name.trim()||'Learner'});
  const resetAll=()=>{reset();setName(initialProgress.learnerName);setShowReset(false);};
  return <div className="page-in mx-auto max-w-[850px]">
    <div className="mb-7"><div className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#8c8499]">Make it yours</div><h1 className="font-display text-[34px] font-extrabold tracking-[-.05em]" data-testid="text-settings-heading">Your learning space.</h1><p className="mt-2 text-[13px] text-[#817b8e]">A few details help make StudyMe feel like yours.</p></div>
    <section className="mb-4 rounded-[22px] border border-[#ebe8ef] bg-white p-5 sm:p-7" data-testid="panel-profile-settings">
      <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eee7f7] text-[#8062a6]"><GraduationCap size={19}/></div><div><h2 className="font-display text-[15px] font-extrabold">Learner profile</h2><p className="text-[10px] text-[#918a9c]">Your name and current education stage</p></div></div>
      <label htmlFor="learner-name" className="mb-2 block text-[11px] font-bold text-[#625b70]">What should we call you?</label><div className="flex flex-col gap-2 sm:flex-row"><input id="learner-name" value={name} onChange={(event)=>setName(event.target.value)} onBlur={saveName} onKeyDown={(event)=>event.key==='Enter'&&saveName()} placeholder="Your name" maxLength={40} data-testid="input-learner-name" className="h-11 flex-1 rounded-xl border border-[#e8e3ed] bg-[#fcfbfd] px-3.5 text-[13px] outline-none focus:border-[#a68bc9] focus:ring-2 focus:ring-[#a68bc9]/15"/><button onClick={saveName} data-testid="button-save-name" className="h-11 rounded-xl bg-[#8060ae] px-5 text-[12px] font-bold text-white hover:bg-[#6f509b]">Save name</button></div>
    </section>
    <section className="mb-4 rounded-[22px] border border-[#ebe8ef] bg-white p-5 sm:p-7" data-testid="panel-level-settings">
      <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fbf1dc] text-[#a88343]"><Layers3 size={18}/></div><div><h2 className="font-display text-[15px] font-extrabold">Choose your learning stage</h2><p className="text-[10px] text-[#918a9c]">Change this any time. Your progress and tokens stay yours.</p></div></div>
      <div className="mb-4 rounded-xl bg-[#f7f3fb] px-4 py-3 text-[11px] text-[#6b5a81]" data-testid="status-selected-level">Currently selected: <b>{selected.label}</b> <span className="text-[#9183a1]">({selected.ageRange})</span></div>
      <div className="grid gap-2 sm:grid-cols-2">{educationLevels.map((level)=>{const active=progress.educationLevelId===level.id;return <button key={level.id} onClick={()=>update({educationLevelId:level.id})} data-testid={`button-level-${level.id}`} aria-pressed={active} className={cx('flex items-start gap-3 rounded-[15px] border p-3.5 text-left',active?'border-[#b49bd2] bg-[#f7f2fb]':'border-[#efedf1] bg-white hover:border-[#d6c9e6] hover:bg-[#fcfafe]')}><span className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',active?'border-[#9876bf] bg-[#9876bf] text-white':'border-[#d7d2dd] text-transparent')}>{active?<Check size={12}/>:<span className="h-2 w-2 rounded-full bg-transparent"/>}</span><span><span className="block text-[12px] font-bold text-[#4d465b]">{level.label}</span><span className="mt-0.5 block text-[10px] font-semibold text-[#9a92a2]">{level.ageRange}</span><span className="mt-1 block text-[10px] leading-relaxed text-[#817b8e]">{level.description}</span></span></button>;})}</div>
    </section>
    <section className="rounded-[22px] border border-[#ebe8ef] bg-white p-5 sm:p-7" data-testid="panel-data-settings">
      <div className="mb-2 font-display text-[15px] font-extrabold">Your demo data</div><p className="max-w-[560px] text-[11px] leading-relaxed text-[#817b8e]">Your learner name, chosen stage, progress, quiz scores, and local tokens are saved in this browser only. Nothing is sent to a server.</p>
      <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl bg-[#f8f6f8] p-4 sm:flex-row sm:items-center"><div><div className="text-[11px] font-bold text-[#625b70]">Start fresh</div><div className="mt-1 text-[10px] text-[#938d9a]">Clear your progress, scores, and tokens on this device.</div></div><button onClick={()=>setShowReset(true)} data-testid="button-reset-progress" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e4d4d2] px-4 text-[11px] font-bold text-[#a05d57] hover:bg-[#fff4f2]"><RotateCcw size={14}/>Reset all progress</button></div>
    </section>
    {showReset&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#28233a]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title" data-testid="dialog-reset-confirm"><div className="w-full max-w-[410px] rounded-[22px] bg-white p-6 shadow-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbefed] text-[#a35d56]"><RotateCcw size={19}/></div><h2 id="reset-dialog-title" className="font-display text-[20px] font-extrabold tracking-[-.03em]">Clear your learning data?</h2><p className="mt-2 text-[12px] leading-relaxed text-[#817b8e]">This removes your name, selected stage, completed lessons, quiz scores, and token collection from this browser. You can’t undo this.</p><div className="mt-6 flex justify-end gap-2"><button onClick={()=>setShowReset(false)} data-testid="button-cancel-reset" className="rounded-xl border border-[#e8e3ed] px-4 py-2.5 text-[11px] font-bold text-[#716a7d]">Keep my progress</button><button onClick={resetAll} data-testid="button-confirm-reset" className="rounded-xl bg-[#a75e57] px-4 py-2.5 text-[11px] font-bold text-white hover:bg-[#914c46]">Yes, reset</button></div></div></div>}
  </div>;
}

function Router() {
  return <Provider><AppShell /></Provider>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;
