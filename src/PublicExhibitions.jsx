import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export default function PublicExhibitions({ onClose }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!db) throw new Error('Firebase 尚未初始化');
        const snap = await getDocs(query(collection(db, 'exhibitions'), where('status', '==', 'published')));
        if (active) { const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.publishedAt?.toMillis?.() || 0) - (a.publishedAt?.toMillis?.() || 0)); setItems(rows); const target = new URLSearchParams(window.location.search).get('exhibition'); if (target) setSelected(rows.find(x => x.id === target) || null); }
      } catch (e) { if (active) setError(e.message || '無法載入公開展覽'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  return <div className="public-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="public-panel"><header><div><span className="eyebrow">VELORA · OPEN EXHIBITIONS</span><h2>{selected ? selected.title : '公開展覽'}</h2><p>{selected ? `${selected.ownerName || '創作者'} · ${selected.category || '展覽'} · ${selected.preferredFloor || 2}F ${selected.preferredZone || 'A'} 展區` : '探索創作者在 VELORA 發布的展覽。'}</p></div><button className="studio-close" onClick={() => selected ? setSelected(null) : onClose()}>{selected ? '返回' : '×'}</button></header>
  {selected ? <><p className="public-description">{selected.description || '創作者尚未填寫展覽介紹。'}</p><button className="public-share" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}?exhibition=${selected.id}`).then(() => alert('展覽連結已複製。')).catch(() => alert('複製失敗，請手動複製網址。'))}>分享展覽連結</button><div className="public-art-grid">{(selected.artworks || []).map((art, i) => <article key={art.id || i}><img src={art.imageUrl} alt={art.title || '展品'} /><h3>{art.title || '未命名作品'}</h3><p>{art.description || '尚未提供作品介紹'}</p></article>)}</div></> : loading ? <div className="studio-empty">正在載入公開展覽…</div> : error ? <div className="studio-alert error">{error}</div> : items.length === 0 ? <div className="studio-empty">目前還沒有公開展覽，創作者發布後就會出現在這裡。</div> : <div className="public-list">{items.map(item => <button className="public-card" key={item.id} onClick={() => setSelected(item)}><div className="public-cover">{item.artworks?.[0]?.imageUrl ? <img src={item.artworks[0].imageUrl} alt=""/> : <span>VELORA</span>}</div><div className="public-card-copy"><span>{item.category || '展覽'} · {item.preferredFloor || 2}F {item.preferredZone || 'A'} 展區</span><h3>{item.title}</h3><p>{item.description || '創作者尚未填寫展覽介紹。'}</p><small>{item.ownerName || '創作者'} · {item.artworks?.length || 0} 件作品</small></div></button>)}</div>}</section></div>;
}
