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
import type { ActorRole } from './lib/actorAccess';

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [actor, setActor] = useState<ActorRole | null>(null);
  function enter(role: ActorRole) {
    setActor(role);
    window.location.hash = '/dashboard';
  }
  function leave() {
    setActor(null);
    window.location.hash = '/login';
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
  if (hash === '#/login' || (hash.startsWith('#/') && !actor))
    return <ActorLogin onEnter={enter} />;
  return hash.startsWith('#/') && actor ? (
    <Workspace
      route={hash.slice(2)}
      actor={actor}
      onLeave={leave}
      buildings={actor === 'owner' ? session.buildings : []}
      onBuildingsChange={actor === 'owner' ? changeBuildings : () => undefined}
      storageStatus={session.status}
    />
  ) : (
    <LandingPage />
  );
}
