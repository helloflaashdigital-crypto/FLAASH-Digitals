import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/UI';

export default function TeamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(id ? null : { status: 'published', displayOrder: 0 });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    let active = true;
    api.get(`/admin/team/${id}`).then(response => { if (active) setItem(response.data.data); })
      .catch(() => { if (active) setError('Unable to load this team member. Return to Team and try again.'); });
    return () => { active = false; };
  }, [id]);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const chooseFile = event => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
      setError('Choose a JPEG, PNG, WebP or AVIF image no larger than 5 MB.');
      event.target.value = '';
      return;
    }
    setError('');
    setRemovePhoto(false);
    setFile(selected);
  };
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.displayOrder = Number(values.displayOrder || 0);
    setBusy(true);
    setError('');
    try {
      if (file) {
        const form = new FormData();
        form.append('image', file);
        form.append('folder', 'team');
        form.append('alt', values.name);
        values.photo = (await api.post('/admin/upload', form)).data.data;
      } else if (removePhoto) values.photo = null;
      if (id) await api.patch(`/admin/team/${id}`, values);
      else await api.post('/admin/team', values);
      navigate('/admin/team');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this team member. Please try again.');
    } finally { setBusy(false); }
  };
  const deleteMember = async () => {
    if (!confirm('Delete this team member? This cannot be undone.')) return;
    setBusy(true);
    try { await api.delete(`/admin/team/${id}`); navigate('/admin/team'); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete this team member.'); }
    finally { setBusy(false); }
  };
  const imageSrc = preview || (!removePhoto && item?.photo?.url) || '';
  return <section className="admin-page">
    <div className="admin-title"><div><p>TEAM MANAGEMENT</p><h1>{id ? 'Edit' : 'New'} Team member</h1></div><Link to="/admin/team">Cancel</Link></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {!item ? !error && <p role="status">Loading team member?</p> : <form className="editor-form" onSubmit={submit}>
      <label>Name<input name="name" defaultValue={item.name || ''} required maxLength={100} disabled={busy}/></label>
      <label>Designation<input name="designation" defaultValue={item.designation || ''} maxLength={120} disabled={busy}/></label>
      <label className="wide">Biography<textarea name="bio" defaultValue={item.bio || ''} maxLength={1500} rows={4} disabled={busy}/></label>
      <label className="wide service-image-upload">Team member photo<input key={removePhoto ? 'removed' : 'selected'} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseFile} disabled={busy}/><small>JPEG, PNG, WebP or AVIF, maximum 5 MB. Published photos appear on the About page.</small>{imageSrc && <img src={imageSrc} alt="Team member photo preview"/>}</label>
      {imageSrc && <div className="wide"><button type="button" className="danger" disabled={busy} onClick={() => { setFile(null); setRemovePhoto(true); }}>Remove photo</button></div>}
      <label>LinkedIn URL<input name="linkedin" type="url" defaultValue={item.linkedin || ''} disabled={busy}/></label>
      <label>Instagram URL<input name="instagram" type="url" defaultValue={item.instagram || ''} disabled={busy}/></label>
      <label>Status<select name="status" defaultValue={item.status} disabled={busy}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
      <label>Display order<input name="displayOrder" type="number" min={0} defaultValue={item.displayOrder ?? 0} disabled={busy}/></label>
      <div className="editor-actions"><Button type="submit" disabled={busy}>{busy ? 'Saving?' : 'Save team member'}</Button>{id && <button type="button" className="danger" disabled={busy} onClick={deleteMember}>Delete team member</button>}</div>
    </form>}
  </section>;
}
