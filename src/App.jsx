import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import {
  auth,
  configured,
  firebaseInitError,
  provider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from './firebase';
import World from './World.jsx';
import ExhibitionStudio from './ExhibitionStudio.jsx';

const floors = [
  { n: 1, title: 'MAIN LOBBY', zh: '大廳與服務中心', detail: '入口大廳及 3 個展示區' },
  { n: 2, title: 'COMMUNITY GALLERY I', zh: '使用者自由展覽區', detail: '3 個獨立自由展區' },
  { n: 3, title: 'COMMUNITY GALLERY II', zh: '使用者自由展覽區', detail: '3 個獨立自由展區' },
  { n: 4, title: 'COMMUNITY GALLERY III', zh: '使用者自由展覽區', detail: '3 個獨立自由展區' },
  { n: 5, title: 'FEATURED EXHIBITION', zh: '特別展覽區', detail: '3 個官方主題展區' }
];

const zoneNames = {
  1: { A: '迎賓作品廊', B: '新秀展示廊', C: '主題作品廊' },
  2: { A: '自由展區 A · 西翼', B: '自由展區 B · 北翼', C: '自由展區 C · 東翼' },
  3: { A: '自由展區 A · 西翼', B: '自由展區 B · 北翼', C: '自由展區 C · 東翼' },
  4: { A: '自由展區 A · 西翼', B: '自由展區 B · 北翼', C: '自由展區 C · 東翼' },
  5: { A: '典藏精選展', B: '年度主題展', C: '策展特別展' }
};

function describeAuthError(error) {
  const code = error?.code || 'auth/unknown';
  const messages = {
    'auth/unauthorized-domain': '目前網站網域尚未加入 Firebase 授權網域。請確認 Authentication → Settings → Authorized domains 有 yunn526.github.io。',
    'auth/operation-not-allowed': 'Firebase 尚未啟用 Google 登入。請到 Authentication → Sign-in method，開啟 Google 並儲存。',
    'auth/invalid-api-key': 'Firebase API Key 不正確。請核對 GitHub Variables 的 VITE_FIREBASE_API_KEY，修改後重新部署。',
    'auth/popup-blocked': '瀏覽器封鎖了登入彈出視窗，系統會改用重新導向登入。',
    'auth/popup-closed-by-user': '登入視窗在完成前被關閉，請重新點擊 Google 登入。',
    'auth/network-request-failed': '網路連線中斷，請確認網路正常後再試。',
    'auth/invalid-oauth-client-id': 'Google OAuth 用戶端設定有誤。請在 Firebase Authentication 的 Google 提供者中重新儲存設定。',
    'auth/cancelled-popup-request': '上一個登入視窗尚未完成，請稍候再試。',
    'auth/operation-not-supported-in-this-environment': '目前瀏覽器不支援彈出登入，請改用一般瀏覽器開啟網站。',
    'auth/configuration-not-found': 'Firebase Authentication 設定尚未完成，請確認已建立 Authentication 並啟用 Google。',
    'auth/invalid-credential': 'Google 登入憑證無效。請確認 Firebase Authentication 的 Google 提供者已啟用，且 Web App 設定屬於同一個 Firebase 專案。',
    'auth/credential-already-in-use': '這個 Google 帳號已連結到其他帳號。',
    'auth/timeout': '登入逾時，請重新嘗試。',
    'auth/internal-error': 'Firebase Authentication 發生內部錯誤；請確認 Google 提供者設定與 OAuth 用戶端，並查看錯誤詳細資訊。',
  };
  return {
    code,
    title: messages[code] || 'Google 登入沒有完成。請保留錯誤代碼，方便精確排查。',
    detail: error?.message || String(error || '未知錯誤'),
  };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [floor, setFloor] = useState(1);
  const [zone, setZone] = useState('lobby');
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [locked, setLocked] = useState(false);
  const [showStudio, setShowStudio] = useState(false);

  useEffect(() => {
    if (!configured || !auth) {
      setAuthReady(true);
      if (firebaseInitError) setAuthError(describeAuthError(firebaseInitError));
      return undefined;
    }

    let alive = true;
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!alive) return;
        setUser(currentUser);
        setAuthReady(true);
      },
      (error) => {
        if (!alive) return;
        setAuthError(describeAuthError(error));
        setAuthReady(true);
      }
    );

    getRedirectResult(auth).catch((error) => {
      if (alive) setAuthError(describeAuthError(error));
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const enterDemo = () => {
    setAuthError(null);
    setUser({ displayName: 'Guest Explorer', isDemo: true });
  };

  const login = async () => {
    setAuthError(null);
    if (!configured || !auth) {
      setAuthError({
        code: 'config/missing',
        title: '這次部署沒有讀到完整的 Firebase 設定。',
        detail: firebaseInitError?.message || '請確認六個 VITE_FIREBASE_* Repository Variables 已設定，並重新執行 GitHub Actions。',
      });
      return;
    }

    setAuthBusy(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return;
      }
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        // Redirect is the fallback for browsers that block popups or popup flows.
        const popupFallbackCodes = [
          'auth/popup-blocked',
          'auth/operation-not-supported-in-this-environment',
          'auth/web-storage-unsupported',
          'auth/unauthorized-domain',
        ];
        if (popupFallbackCodes.includes(error?.code)) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw error;
      }
    } catch (error) {
      setAuthError(describeAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setLocked(false);
    setShowStudio(false);
    if (user?.isDemo) { setUser(null); return; }
    if (auth) await signOut(auth);
  };

  if (!authReady) return <div className="loading">正在準備展館…</div>;
  if (!user) return (
    <main className="welcome">
      <div className="welcome-art"><div className="art-ring ring1" /><div className="art-ring ring2" /><div className="art-caption">VELORA<br /><span>EXHIBITION WORLD</span></div></div>
      <section className="welcome-copy">
        <div className="eyebrow">A WORLD BUILT FOR EXHIBITIONS</div>
        <h1>Every story<br />deserves a space.</h1>
        <p>走進一座可以自由探索的虛擬美術館。<br />五層空間，每層都有三個獨立展區。</p>
        <button className="primary" onClick={login} disabled={authBusy}>{authBusy ? '正在連接 Google…' : '使用 Google 登入'}</button>
        <button className="secondary" onClick={enterDemo}>先探索展示模式</button>
        {authError && (
          <div className="auth-error" role="alert">
            <b>{authError.title}</b>
            <p>{authError.detail}</p>
            <code>{authError.code}</code>
            <button type="button" onClick={() => setAuthError(null)}>關閉訊息</button>
          </div>
        )}
        <small>展示模式不會保存帳號或個人資料。</small>
      </section>
    </main>
  );

  const currentFloor = floors.find((item) => item.n === floor);
  const currentZone = zone === 'lobby' ? '中央大廳' : zoneNames[floor][zone];

  return (
    <div className="app">
      <Canvas camera={{ position: [0, 1.72, 15.2], fov: 67 }} dpr={[1, 1.5]} shadows={{ type: 'PCFSoft' }}>
        <color attach="background" args={['#17191d']} />
        <fog attach="fog" args={['#d9d4cc', 38, 105]} />
        <ambientLight intensity={0.82} />
        <hemisphereLight args={['#fff5e8', '#77736c', 0.55]} />
        <directionalLight position={[7, 24, 8]} intensity={1.45} castShadow shadow-mapSize={[1024, 1024]} />
        <World floor={floor} locked={locked} zone={zone} />
        <PointerLockControls onLock={() => setLocked(true)} onUnlock={() => setLocked(false)} />
      </Canvas>

      <header className="hud topbar">
        <div className="brand">VELORA <span>EXHIBITION WORLD</span></div>
        <div className="account">
          <span>{user.displayName || user.email || 'Explorer'}</span>
          {!user.isDemo && <button onClick={() => { setLocked(false); setShowStudio(true); }}>我的展覽</button>}
          <button onClick={logout}>離開</button>
        </div>
      </header>

      <aside className="floor-panel">
        <div className="eyebrow">EXPLORE FLOORS</div>
        {floors.slice().reverse().map((item) => (
          <button key={item.n} className={floor === item.n ? 'active' : ''} onClick={() => { setFloor(item.n); setZone('lobby'); setLocked(false); }}>
            <b>{item.n}F</b><span>{item.zh}</span>
          </button>
        ))}
        <div className="zone-divider" />
        <div className="eyebrow zone-heading">EXPLORE 3 GALLERIES</div>
        {['A', 'B', 'C'].map((key) => (
          <button key={key} className={`zone-link ${zone === key ? 'active' : ''}`} onClick={() => { setZone(key); setLocked(false); }}>
            <b>{key}</b><span>{zoneNames[floor][key]}</span>
          </button>
        ))}
      </aside>

      <div className="floor-status"><span>{currentFloor.title}</span><b>{currentFloor.detail} · {currentZone}</b></div>
      <div className="bottom-hint">
        <span>{locked ? '正在自由探索' : '點擊展館畫面開始探索'}</span>
        <kbd>W A S D</kbd><span>移動</span><kbd>SHIFT</kbd><span>加速</span><kbd>ESC</kbd><span>退出視角</span>
      </div>
      <button className="help" onClick={() => setShowControls((value) => !value)}>?</button>
      {showControls && (
        <div className="help-card">
          <button className="close" onClick={() => setShowControls(false)}>×</button>
          <b>探索操作</b>
          <p>點擊展館畫面鎖定滑鼠</p>
          <p>W A S D 或方向鍵移動</p>
          <p>Shift 加速 · ESC 退出視角</p>
          <p>左側可切換五層樓及三個展區</p>
          <p>每層皆有西翼、北翼、東翼三個獨立展區</p>
        </div>
      )}
      {showStudio && !user.isDemo && <ExhibitionStudio user={user} onClose={() => setShowStudio(false)} />}
    </div>
  );
}
