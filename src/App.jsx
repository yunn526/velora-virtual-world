import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { auth, configured, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import World from './World.jsx';

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

export default function App() {
  const [user, setUser] = useState(null);
  const [floor, setFloor] = useState(1);
  const [zone, setZone] = useState('lobby');
  const [authReady, setAuthReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!configured) { setAuthReady(true); return; }
    return onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setAuthReady(true); });
  }, []);

  const enterDemo = () => setUser({ displayName: 'Guest Explorer', isDemo: true });
  const login = async () => {
    if (!configured) { alert('目前尚未設定 Firebase。可以先使用展示模式瀏覽展館。'); return; }
    try { await signInWithPopup(auth, provider); }
    catch (error) { alert(error.message); }
  };
  const logout = async () => {
    setLocked(false);
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
        <button className="primary" onClick={login}>使用 Google 登入</button>
        <button className="secondary" onClick={enterDemo}>先探索展示模式</button>
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
        <div className="account"><span>{user.displayName || user.email || 'Explorer'}</span><button onClick={logout}>離開</button></div>
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
    </div>
  );
}
