import React, { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const emptyForm = {
  title: '',
  description: '',
  category: '攝影',
  preferredFloor: '2',
  preferredZone: 'A',
  artworks: [],
};

function explainFirestoreError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore 權限尚未設定，請在 Firebase Firestore Rules 套用專案附帶的 firestore.rules。';
  }
  if (error?.code === 'unavailable' || error?.code === 'failed-precondition') {
    return 'Firestore 尚未建立或目前無法連線，請確認 Firebase Console 已建立 Firestore Database。';
  }
  return `${error?.code || '未知錯誤'}：${error?.message || '請稍後再試。'}`;
}

export default function ExhibitionStudio({ user, onClose }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState('');
  const [artworkDescription, setArtworkDescription] = useState('');

  const loadItems = useCallback(async () => {
    if (!db || !user?.uid) {
      setLoading(false);
      setError('Firebase 尚未正確初始化，請先確認登入設定。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ownQuery = query(collection(db, 'exhibitions'), where('ownerUid', '==', user.uid));
      const snapshot = await getDocs(ownQuery);
      const rows = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
      rows.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || 0;
        const bTime = b.updatedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setItems(rows);
    } catch (loadError) {
      setError(explainFirestoreError(loadError));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title) { setError('請先填寫展覽名稱。'); return; }
    if (title.length > 80) { setError('展覽名稱最多 80 個字。'); return; }
    if (description.length > 500) { setError('展覽介紹最多 500 個字。'); return; }
    if (!db || !user?.uid) { setError('目前無法連線 Firebase。'); return; }

    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ownerUid: user.uid,
      ownerName: user.displayName || user.email || 'VELORA Creator',
      title,
      description,
      category: form.category,
      preferredFloor: Number(form.preferredFloor),
      preferredZone: form.preferredZone,
      artworks: form.artworks || [],
      status: 'draft',
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'exhibitions', editingId), payload);
        setNotice('展覽草稿已更新。');
      } else {
        await addDoc(collection(db, 'exhibitions'), { ...payload, createdAt: serverTimestamp() });
        setNotice('展覽草稿已建立。');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadItems();
    } catch (saveError) {
      setError(explainFirestoreError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const uploadArtwork = async (file) => {
    if (!file || !user?.uid || !storage) { setError('Firebase Storage 尚未初始化。'); return; }
    if (!file.type.startsWith('image/')) { setError('請選擇圖片檔案。'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('圖片不可超過 10 MB。'); return; }
    setUploading(true); setError('');
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `artworks/${user.uid}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setForm((current) => ({ ...current, artworks: [...(current.artworks || []), { id: path, title: artworkTitle.trim() || file.name, description: artworkDescription.trim(), imageUrl: url, storagePath: path, fileName: file.name, createdAt: new Date().toISOString() }] }));
      setArtworkTitle(''); setArtworkDescription(''); setNotice('作品圖片已上傳並加入展覽草稿。');
    } catch (uploadError) { setError(explainFirestoreError(uploadError)); }
    finally { setUploading(false); }
  };

  const removeArtwork = async (artwork) => {
    if (!window.confirm(`移除作品「${artwork.title}」？`)) return;
    try { if (artwork.storagePath && storage) await deleteObject(ref(storage, artwork.storagePath)); } catch (_) {}
    setForm((current) => ({ ...current, artworks: (current.artworks || []).filter((a) => a.id !== artwork.id) }));
  };

  const togglePublish = async (item) => {
    if (item.status !== 'published' && !(item.artworks || []).length) { setError('至少上傳一件作品，才能發布展覽。'); return; }
    try {
      await updateDoc(doc(db, 'exhibitions', item.id), { status: item.status === 'published' ? 'draft' : 'published', publishedAt: item.status === 'published' ? null : serverTimestamp(), updatedAt: serverTimestamp() });
      setNotice(item.status === 'published' ? '展覽已撤回，改為草稿。' : '展覽已公開發布！'); await loadItems();
    } catch (publishError) { setError(explainFirestoreError(publishError)); }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '攝影',
      preferredFloor: String(item.preferredFloor || 2),
      preferredZone: item.preferredZone || 'A',
      artworks: item.artworks || [],
    });
    setError('');
    setNotice('正在編輯展覽草稿。');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (item) => {
    if (!window.confirm(`確定刪除「${item.title}」這份展覽草稿嗎？`)) return;
    try {
      await deleteDoc(doc(db, 'exhibitions', item.id));
      setNotice('展覽草稿已刪除。');
      if (editingId === item.id) { setEditingId(null); setForm(emptyForm); }
      await loadItems();
    } catch (deleteError) {
      setError(explainFirestoreError(deleteError));
    }
  };

  return (
    <div className="studio-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="studio-panel" role="dialog" aria-modal="true" aria-labelledby="studio-title">
        <header className="studio-header">
          <div>
            <div className="eyebrow">VELORA · PHASE 2</div>
            <h2 id="studio-title">我的展覽工作室</h2>
            <p>建立展覽草稿，設定預計樓層與展區。</p>
          </div>
          <button className="studio-close" onClick={onClose} aria-label="關閉">×</button>
        </header>

        {error && <div className="studio-alert error">{error}</div>}
        {notice && <div className="studio-alert notice">{notice}</div>}

        <form className="studio-form" onSubmit={save}>
          <div className="studio-form-heading">
            <h3>{editingId ? '編輯展覽草稿' : '建立新展覽'}</h3>
            <span>草稿不會自動公開</span>
          </div>
          <label>展覽名稱<input value={form.title} onChange={(event) => setField('title', event.target.value)} maxLength={80} placeholder="例如：光影之間" required /></label>
          <label>展覽介紹<textarea value={form.description} onChange={(event) => setField('description', event.target.value)} maxLength={500} rows={3} placeholder="介紹這次展覽的主題與創作理念……" /></label>
          <div className="studio-fields-row">
            <label>展覽類型<select value={form.category} onChange={(event) => setField('category', event.target.value)}><option>攝影</option><option>繪畫</option><option>插畫</option><option>設計</option><option>手作</option><option>其他</option></select></label>
            <label>預計樓層<select value={form.preferredFloor} onChange={(event) => setField('preferredFloor', event.target.value)}><option value="2">2F</option><option value="3">3F</option><option value="4">4F</option></select></label>
            <label>預計展區<select value={form.preferredZone} onChange={(event) => setField('preferredZone', event.target.value)}><option value="A">A 西翼</option><option value="B">B 北翼</option><option value="C">C 東翼</option></select></label>
          </div>
          <div className="studio-upload-note"><b>作品管理 · {(form.artworks || []).length} 件</b><span>上傳 JPG、PNG、WebP；單張最大 10 MB。圖片會儲存至 Firebase Storage。</span></div>
          <div className="artwork-upload-fields"><label>作品名稱<input value={artworkTitle} onChange={(e) => setArtworkTitle(e.target.value)} placeholder="作品名稱（可留空）" /></label><label>作品介紹<textarea rows="2" value={artworkDescription} onChange={(e) => setArtworkDescription(e.target.value)} placeholder="作品簡介（選填）" /></label><label className="upload-button">{uploading ? '上傳中…' : '選擇圖片並上傳'}<input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file=e.target.files?.[0]; if(file) uploadArtwork(file); e.target.value=''; }} /></label></div>
          {(form.artworks || []).length > 0 && <div className="artwork-grid">{form.artworks.map((art) => <article className="artwork-card" key={art.id}><img src={art.imageUrl} alt={art.title}/><div><b>{art.title}</b><small>{art.description || '尚未填寫作品介紹'}</small><button type="button" className="danger" onClick={() => removeArtwork(art)}>移除作品</button></div></article>)}</div>}
          <div className="studio-actions">
            {editingId && <button type="button" className="studio-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); setNotice('已取消編輯。'); }}>取消編輯</button>}
            <button type="submit" className="studio-primary" disabled={saving}>{saving ? '儲存中…' : editingId ? '儲存變更' : '建立展覽草稿'}</button>
          </div>
        </form>

        <div className="studio-list-heading"><h3>我的展覽</h3><span>{items.length} 個展覽 · {items.filter(x => x.status === 'published').length} 個公開 · {items.reduce((sum,x) => sum + (x.artworks || []).length,0)} 件作品</span></div>
        {loading ? <div className="studio-empty">正在載入展覽資料…</div> : items.length === 0 ? <div className="studio-empty">目前還沒有展覽。建立第一份展覽草稿吧！</div> : (
          <div className="studio-list">
            {items.map((item) => (
              <article className="studio-item" key={item.id}>
                <div className="studio-item-main">
                  <span className={`studio-draft ${item.status === 'published' ? 'published' : ''}`}>{item.status === 'published' ? '已公開' : '草稿'}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description || '尚未填寫展覽介紹'}</p>
                  <small>{item.category} · {item.preferredFloor || 2}F · {item.preferredZone || 'A'} 展區 · {(item.artworks || []).length} 件作品</small>
                </div>
                <div className="studio-item-actions">
                  <button onClick={() => togglePublish(item)}>{item.status === 'published' ? '撤回' : '發布'}</button>
                  <button onClick={() => edit(item)}>編輯</button>
                  <button className="danger" onClick={() => remove(item)}>刪除</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
