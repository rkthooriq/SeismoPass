import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import Workspace from './features/workspace/Workspace';
import { demoBuildings } from './lib/demo';
import {
  loadBuildingSession,
  saveBuildingSession,
} from './lib/buildingSession';
import type { Building } from './types/building';
import { signInEvent } from './components/RouteLoader';
import ActorLogin from './features/access/ActorLogin';
import ReportWorkspace from './features/reports/ReportWorkspace';
import { updateOwnProfile } from './lib/userProfile';
import type { ProfileInput } from './lib/userProfile';
import { sampleReports, releaseSurveyorAssignments } from './lib/reportDemo';
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
  createManagedSurveyor,
  issueTemporaryPassword,
  changeInitialPassword,
  generateTemporaryPassword,
} from './lib/surveyorAccess';
import type { NewSurveyorInput } from './lib/surveyorAccess';
import { createSurveyorBatch } from './lib/surveyorImport';
import { demoId } from './lib/demoId';
import RvsLab from './features/rvs/RvsLab';
import AccountPortal from './features/onboarding/AccountPortal';
import type { ReviewAction } from './features/onboarding/SurveyorManagement';

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
  function saveProfile(input: ProfileInput) {
    const result = updateOwnProfile(account, input);
    if ('error' in result) return result.error;
    updateWorkflow(
      workflow.accounts.map((person) =>
        person.id === result.account.id ? result.account : person,
      ),
      workflow.reports,
    );
    return '';
  }
  function enter(person: DemoAccount) {
    // Only signing in, registering, or opening the sample shows the loader.
    window.dispatchEvent(new Event(signInEvent));
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
    // Kata sandi hanya ada di memori tab. Akun buatan admin yang sandinya
    // hilang (misalnya setelah muat ulang) perlu sandi sementara baru.
    if (!match || !match.password || data.password !== match.password)
      return 'Email atau kata sandi tidak cocok. Pesurvei yang kehilangan sandi perlu meminta sandi sementara baru dari admin.';
    enter(match);
    return '';
  }
  function registerOwner(data: AccountForm) {
    const errors = validateAccountForm('register', data);
    if (Object.keys(errors).length) return Object.values(errors).join(' ');
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@example\.com$/.test(email))
      return 'Untuk saat ini pendaftaran hanya menerima alamat @example.com.';
    if (workflow.accounts.some((person) => person.email === email))
      return 'Email sudah terdaftar. Masuk dengan akun tersebut.';
    if (workflow.accounts.length >= 500)
      return 'Batas jumlah akun pada sesi ini tercapai.';
    const person: DemoAccount = {
      id: demoId(),
      name: data.name.trim(),
      email,
      role: 'owner',
      // Kata sandi pilihan pengguna hanya disimpan di memori tab, tidak di sesi.
      password: data.password,
      status: 'pending-email',
      emailVerified: false,
      history: [
        {
          action: 'submitted',
          by: 'pemohon',
          note: 'Pendaftaran pelapor dibuat.',
          at: new Date().toISOString(),
        },
      ],
    };
    updateWorkflow([...workflow.accounts, person], workflow.reports);
    enter(person);
    return '';
  }
  // Sandi sementara hanya dikembalikan sekali ke layar admin dan tidak
  // pernah disimpan di sesi browser.
  function addSurveyor(input: NewSurveyorInput) {
    if (!account) return { error: 'Masuk sebagai admin terlebih dahulu.' };
    const password = generateTemporaryPassword();
    const result = createManagedSurveyor(
      account,
      input,
      workflow.accounts,
      demoId(),
      password,
    );
    if ('error' in result) return result;
    updateWorkflow([...workflow.accounts, result.account], workflow.reports);
    return {
      name: result.account.name,
      email: result.account.email,
      password,
    };
  }
  function importSurveyors(inputs: NewSurveyorInput[]) {
    if (!account) return { error: 'Masuk sebagai admin terlebih dahulu.' };
    const result = createSurveyorBatch(account, inputs, workflow.accounts, () => ({
      id: demoId(), password: generateTemporaryPassword(),
    }));
    if ('error' in result) return result;
    updateWorkflow(result.accounts, workflow.reports);
    return { issued: result.issued };
  }
  function reissuePassword(id: string) {
    const person = workflow.accounts.find((candidate) => candidate.id === id);
    if (!account || !person) return { error: 'Akun pesurvei tidak ditemukan.' };
    const password = generateTemporaryPassword();
    const next = issueTemporaryPassword(account, person, password);
    if (!next)
      return {
        error:
          'Sandi sementara hanya dapat diterbitkan untuk pesurvei buatan admin yang aktif atau belum mengganti sandi.',
      };
    updateWorkflow(
      workflow.accounts.map((candidate) =>
        candidate.id === id ? next : candidate,
      ),
      workflow.reports,
    );
    return { name: next.name, email: next.email, password };
  }
  function changePassword(current: string, next: string, confirm: string) {
    if (!account) return 'Masuk terlebih dahulu.';
    const result = changeInitialPassword(account, current, next, confirm);
    if ('error' in result) return result.error;
    updateWorkflow(
      workflow.accounts.map((person) =>
        person.id === account.id ? result.account : person,
      ),
      workflow.reports,
    );
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
      const nextHash = window.location.hash;
      setHash(nextHash);
      // Section anchors keep native scrolling; only app routes start at the top.
      if (!nextHash || nextHash.startsWith('#/')) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  if (!hash.startsWith('#/')) return <LandingPage />;
  const path = hash.slice(2);
  if (path === 'rvs-lab' || path === 'rvs-demo' || path.startsWith('rvs-demo?'))
    return <RvsLab key={path} path={path} />;
  if (path === 'flows' || path === 'dashboard/flow') return <RetiredFlowPage />;
  // #/contoh opens the sample owner workspace straight from the landing page.
  if (path === 'contoh')
    return (
      <OpenSample
        onOpen={() =>
          enter(workflow.accounts.find((person) => person.id === 'owner-demo')!)
        }
      />
    );
  if (isAccountPage(path) || !account) {
    const page = isAccountPage(path) ? path : 'login';
    return (
      <ActorLogin
        key={page}
        page={page}
        onSignIn={signIn}
        onRegister={registerOwner}
      />
    );
  }
  if (account.status !== 'active')
    return (
      <AccountPortal
        key={`${account.id}-${account.status}`}
        account={account}
        onLeave={leave}
        onChangePassword={changePassword}
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
        key={account.id}
        route={path}
        account={account}
        accounts={workflow.accounts}
        reports={workflow.reports}
        onChange={(reports) => updateWorkflow(workflow.accounts, reports)}
        onProfileSave={saveProfile}
        onReview={review}
        onAddSurveyor={addSurveyor}
        onImportSurveyors={importSurveyors}
        onReissuePassword={reissuePassword}
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

function RetiredFlowPage() {
  useEffect(() => {
    window.location.replace('#');
  }, []);
  return null;
}

function OpenSample({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    onOpen();
    // Run once on arrival; onOpen changes the route away from #/contoh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
