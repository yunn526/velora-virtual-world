import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, KeyboardControls, Stars } from '@react-three/drei';
import { auth, configured, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import World from './World.jsx';

const floors = [
  {n:1, title:'MAIN LOBBY', zh:'大廳與服務中心'},
  {n:2, title:'COMMUNITY GALLERY I', zh:'使用者自由展覽區'},
  {n:3, title:'COMMUNITY GALLERY II', zh:'使用者自由展覽區'},
  {n:4, title:'COMMUNITY GALLERY III', zh:'使用者自由展覽區'},
  {n:5, title:'FEATURED EXHIBITION', zh:'特別展覽區'}
];

export default function App(){
  const [user,setUser]=useState(null);
  const [floor,setFloor]=useState(1);
  const [authReady,setAuthReady]=useState(false);
  const [showControls,setShowControls]=useState(true);

  useEffect(()=>{
    if(!configured){setAuthReady(true);return;}
    return onAuthStateChanged(auth,u=>{setUser(u);setAuthReady(true);});
  },[]);

  const enterDemo=()=>setUser({displayName:'Guest Explorer',isDemo:true});
  const login=async()=>{ if(!configured){alert('請先在 src/firebase.js 設定 Firebase。');return;} try{await signInWithPopup(auth,provider);}catch(e){alert(e.message);} };
  const logout=async()=>{if(user?.isDemo){setUser(null);return;} if(auth) await signOut(auth);};

  if(!authReady) return <div className="loading">正在準備展館…</div>;
  if(!user) return <main className="welcome">
    <div className="welcome-art"><div className="art-ring ring1"/><div className="art-ring ring2"/><div className="art-caption">VELORA<br/><span>EXHIBITION WORLD</span></div></div>
    <section className="welcome-copy"><div className="eyebrow">A WORLD BUILT FOR EXHIBITIONS</div><h1>Every story<br/>deserves a space.</h1><p>走進一座可以自由探索的虛擬美術館。<br/>在這裡，每一層都有不同的故事。</p><button className="primary" onClick={login}>使用 Google 登入</button><button className="secondary" onClick={enterDemo}>先探索展示模式</button><small>展示模式不會保存帳號或個人資料。</small></section>
  </main>;

  return <div className="app">
    <Canvas camera={{position:[0,1.65,5],fov:70}} shadows>
      <color attach="background" args={['#17191d']}/>
      <fog attach="fog" args={['#17191d',18,48]}/>
      <ambientLight intensity={0.7}/>
      <directionalLight position={[8,12,5]} intensity={1.4} castShadow shadow-mapSize={[1024,1024]}/>
      <Stars radius={90} depth={40} count={900} factor={2} fade/>
      <World floor={floor} />
      <PointerLockControls />
    </Canvas>
    <header className="hud topbar"><div className="brand">VELORA <span>EXHIBITION WORLD</span></div><div className="account"><span>{user.displayName||user.email||'Explorer'}</span><button onClick={logout}>登出</button></div></header>
    <aside className="floor-panel"><div className="eyebrow">EXPLORE FLOORS</div>{floors.slice().reverse().map(f=><button key={f.n} className={floor===f.n?'active':''} onClick={()=>setFloor(f.n)}><b>{f.n}F</b><span>{f.zh}</span></button>)}</aside>
    <div className="bottom-hint"><span>點擊畫面進入自由視角</span><kbd>W A S D</kbd><span>移動</span><kbd>SHIFT</kbd><span>加速</span><kbd>ESC</kbd><span>退出視角</span></div>
    <button className="help" onClick={()=>setShowControls(v=>!v)}>?</button>
    {showControls&&<div className="help-card"><button className="close" onClick={()=>setShowControls(false)}>×</button><b>探索操作</b><p>點擊展館畫面鎖定滑鼠</p><p>W A S D 移動 · 滑鼠看方向</p><p>Shift 加速 · ESC 退出</p><p>左側樓層按鈕切換樓層</p></div>}
  </div>
}
