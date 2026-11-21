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
import { db } from './firebase';

const emptyForm = {
  title: '',
  description: '',
  category: '攝影',
  preferredFloor: '2',
  preferredZone: 'A',
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

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '攝影',
      preferredFloor: String(item.preferredFloor || 2),
      preferredZone: item.preferredZone || 'A',
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
          <div className="studio-upload-note"><b>作品圖片上傳</b><span>下一步接入圖片儲存服務；目前先建立展覽資料與草稿，避免圖片尚未儲存就誤以為已上傳。</span></div>
          <div className="studio-actions">
            {editingId && <button type="button" className="studio-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); setNotice('已取消編輯。'); }}>取消編輯</button>}
            <button type="submit" className="studio-primary" disabled={saving}>{saving ? '儲存中…' : editingId ? '儲存變更' : '建立展覽草稿'}</button>
          </div>
        </form>

        <div className="studio-list-heading"><h3>我的展覽</h3><span>{items.length} 份草稿／紀錄</span></div>
        {loading ? <div className="studio-empty">正在載入展覽資料…</div> : items.length === 0 ? <div className="studio-empty">目前還沒有展覽。建立第一份展覽草稿吧！</div> : (
          <div className="studio-list">
            {items.map((item) => (
              <article className="studio-item" key={item.id}>
                <div className="studio-item-main">
                  <span className="studio-draft">草稿</span>
                  <h4>{item.title}</h4>
                  <p>{item.description || '尚未填寫展覽介紹'}</p>
                  <small>{item.category} · {item.preferredFloor || 2}F · {item.preferredZone || 'A'} 展區</small>
                </div>
                <div className="studio-item-actions">
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
