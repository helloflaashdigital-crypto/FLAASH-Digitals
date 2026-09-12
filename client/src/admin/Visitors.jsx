import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { EmptyState } from '../components/UI';

export default function Visitors() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get('/admin/visitors', { params: { page, status } }).then(response => {
      if (active) setData(response.data.data);
    }).catch(requestError => {
      if (active) setError(requestError.response?.data?.message || 'Unable to load visitors. Please try again.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, status, refresh]);
  return <section className="admin-page">
    <div className="admin-title"><div><p>WEBSITE ACTIVITY</p><h1>Visitors</h1></div><button className="admin-button" disabled={loading} onClick={() => setRefresh(value => value + 1)}>Refresh</button></div>
    <div className="admin-panel"><p>Each browser tab session is listed once. Contact details appear when a visitor submits the welcome form; other visitors remain anonymous.</p>
      <label>Show <select aria-label="Filter visitors" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All visitors</option><option value="submitted">Submitted details</option><option value="anonymous">Anonymous visitors</option></select></label>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : loading ? <p role="status">Loading visitors?</p> : data?.items.length ? <>
      <p>{data.total} visitor session{data.total === 1 ? '' : 's'}</p>
      <div className="table-wrap"><table><thead><tr><th>Company name</th><th>Email</th><th>Phone number</th><th>First visit</th><th>Last visit</th><th>Landing page</th><th>Details</th></tr></thead><tbody>{data.items.map(visitor => <tr key={visitor._id}>
        <td><b>{visitor.company || 'Anonymous visitor'}</b></td><td>{visitor.email || '?'}</td><td>{visitor.phone || '?'}</td>
        <td>{new Date(visitor.createdAt).toLocaleString()}</td><td>{new Date(visitor.lastVisitedAt).toLocaleString()}</td><td>{visitor.landingPage || '/'}</td>
        <td><span className={`status status--${visitor.submittedAt ? 'published' : 'draft'}`}>{visitor.submittedAt ? 'Submitted' : 'Not provided'}</span></td>
      </tr>)}</tbody></table></div>
      <div className="editor-actions"><button className="admin-button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {data.pages}</span><button className="admin-button" disabled={page >= data.pages} onClick={() => setPage(value => value + 1)}>Next</button></div>
    </> : <EmptyState>No {status === 'submitted' ? 'submitted' : status === 'anonymous' ? 'anonymous' : ''} visitors yet.</EmptyState>}
  </section>;
}
