import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import Workspace from './features/workspace/Workspace';
import { demoBuildings } from './lib/demo';
import {
  loadBuildingSession,
  saveBuildingSession,
} from './lib/buildingSession';
import type { Building } from './types/building';
import ActorLogin from './features/access/ActorLogin';
import ReportWorkspace from './features/reports/ReportWorkspace';
import {
  demoPassword,
  sampleReports,
  releaseSurveyorAssignments,
} from './lib/reportDemo';
import type { DemoAccount, Report } from './lib/reportDemo';
import type { AccountForm } from './lib/accountFlow';
import { isAccountPage, validateAccountForm } from './lib/accountFlow';
import { restoreReports } from './lib/reportSession';
import {
  demoSessionKey,
  restoreDemoSession,
  serializeDemoSession,
} from './lib/demoDirectory';
import {
  verifyDemoEmail,
  reviewSurveyor,
  resubmitSurveyor,
} from './lib/surveyorAccess';
import { demoId } from './lib/demoId';
import RvsLab from './features/rvs/RvsLab';
import AccountPortal from './features/onboarding/AccountPortal';
import type { ReviewAction } from './features/onboarding/SurveyorManagement';
import RoleFlowGuide from './features/reports/RoleFlowGuide';

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState(loadWorkflow);
  const [storageFailed, setStorageFailed] = useState(false);
  const account =
    workflow.accounts.find((person) => person.id === accountId) ?? null;
  function updateWorkflow(accounts: DemoAccount[], reports: Report[]) {
    setWorkflow({ accounts, reports, invalid: false });
    try {
      window.sessionStorage.setItem(
        demoSessionKey,
        serializeDemoSession(accounts, reports),
      );
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }
  function enter(person: DemoAccount) {
    setAccountId(person.id);
    window.location.hash = '/dashboard';
  }
  function leave() {
    setAccountId(null);
    window.location.hash = '/login';
  }
  function signIn(data: AccountForm) {
    const match = workflow.accounts.find(
      (person) => person.email === data.email.trim().toLowerCase(),
    );
    if (!match || data.password !== demoPassword)
      return 'Email atau kata sandi demo tidak cocok.';
    enter(match);
    return '';
  }
  function createAccount(data: AccountForm, role: 'owner' | 'surveyor') {
    const errors = validateAccountForm(
      role === 'owner' ? 'register' : 'request-access',
      data,
    );
    if (Object.keys(errors).length) return Object.values(errors).join(' ');
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@example\.com$/.test(email))
      return 'Gunakan alamat fiktif dengan domain example.com.';
    if (workflow.accounts.some((person) => person.email === email))
      return 'Email demo sudah digunakan. Masuk untuk melihat status akun atau pengajuanmu.';
    if (workflow.accounts.length >= 500)
      return 'Batas akun demo sesi ini tercapai.';
    if (role === 'owner' && data.password !== demoPassword)
      return `Gunakan kata sandi demo bersama: ${demoPassword}`;
    const person: DemoAccount = {
      id: demoId(),
      name: data.name.trim(),
      email,
      role,
      password: demoPassword,
      status: 'pending-email',
      emailVerified: false,
      organization: role === 'surveyor' ? data.organization.trim() : undefined,
      qualification: role === 'surveyor' ? data.reference.trim() : undefined,
      history: [
        {
          action: 'submitted',
          by: 'pemohon',
          note:
            role === 'surveyor'
              ? 'Pengajuan akses pesurvei demo dibuat.'
              : 'Pendaftaran pelapor demo dibuat.',
          at: new Date().toISOString(),
        },
      ],
    };
    updateWorkflow([...workflow.accounts, person], workflow.reports);
    enter(person);
    return '';
  }
  function review(
    id: string,
    action: ReviewAction,
    note: string,
    checked: boolean,
  ) {
    if (!account) return false;
    const person = workflow.accounts.find((candidate) => candidate.id === id);
    if (!person) return false;
    const next = reviewSurveyor(account, person, action, note, checked);
    if (!next) return false;
    const reports =
      action === 'suspend'
        ? releaseSurveyorAssignments(workflow.reports, id, account)
        : workflow.reports;
    updateWorkflow(
      workflow.accounts.map((candidate) =>
        candidate.id === id ? next : candidate,
      ),
      reports,
    );
    return true;
  }
  const [session, setSession] = useState(() =>
    loadBuildingSession(() => window.sessionStorage, demoBuildings),
  );
  function changeBuildings(buildings: Building[]) {
    const persisted = saveBuildingSession(
      () => window.sessionStorage,
      buildings,
    );
    setSession({ buildings, status: persisted ? 'restored' : 'unavailable' });
  }
  useEffect(() => {
    const change = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  if (!hash.startsWith('#/')) return <LandingPage />;
  const path = hash.slice(2);
  if (path === 'rvs-lab' || path === 'rvs-demo' || path.startsWith('rvs-demo?'))
    return <RvsLab key={path} path={path} />;
  if (path === 'flows')
    return (
      <div className="workspace report-workspace">
        <header className="report-top">
          <a href="#" className="ws-logo">
            seismopass.
          </a>
          <a href="#/dashboard">Buka dashboard →</a>
        </header>
        <main className="ws-main">
          <RoleFlowGuide />
        </main>
      </div>
    );
  if (isAccountPage(path) || !account) {
    const page = isAccountPage(path) ? path : 'login';
    return (
      <ActorLogin
        key={page}
        page={page}
        availableAccounts={workflow.accounts}
        onExplore={() =>
          enter(workflow.accounts.find((person) => person.id === 'owner-demo')!)
        }
        onSignIn={signIn}
        onRegister={(data) => createAccount(data, 'owner')}
        onRequest={(data) => createAccount(data, 'surveyor')}
      />
    );
  }
  if (account.status !== 'active')
    return (
      <AccountPortal
        key={`${account.id}-${account.status}`}
        account={account}
        onLeave={leave}
        onVerify={() => {
          const next = verifyDemoEmail(account);
          if (next)
            updateWorkflow(
              workflow.accounts.map((person) =>
                person.id === next.id ? next : person,
              ),
              workflow.reports,
            );
        }}
        onResubmit={(organization, qualification) => {
          const next = resubmitSurveyor(account, organization, qualification);
          if (!next) return false;
          updateWorkflow(
            workflow.accounts.map((person) =>
              person.id === next.id ? next : person,
            ),
            workflow.reports,
          );
          return true;
        }}
      />
    );
  if (
    path === 'dashboard' ||
    path.startsWith('dashboard/') ||
    account.id !== 'owner-demo'
  )
    return (
      <ReportWorkspace
        key={`${account.id}-${path}`}
        route={path}
        account={account}
        accounts={workflow.accounts}
        reports={workflow.reports}
        onChange={(reports) => updateWorkflow(workflow.accounts, reports)}
        onReview={review}
        onLeave={leave}
        storageFailed={storageFailed}
        invalidSession={workflow.invalid}
      />
    );
  return (
    <Workspace
      route={path}
      actor="owner"
      onLeave={leave}
      buildings={session.buildings}
      onBuildingsChange={changeBuildings}
      storageStatus={session.status}
    />
  );
}
function loadWorkflow() {
  try {
    const raw = window.sessionStorage.getItem(demoSessionKey);
    const legacy = restoreReports(
      window.sessionStorage.getItem('seismopass.reports.demo.v1'),
      sampleReports,
    );
    return restoreDemoSession(raw, legacy);
  } catch {
    return restoreDemoSession(null, sampleReports);
  }
}
