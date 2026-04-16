import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

const starIcon = (filled) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="2" width="22" height="22">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const trashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

export default function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('submit');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [form, setForm] = useState({
    studentName: '', courseName: '', rating: 0, comments: ''
  });
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/feedback`);
      const data = await res.json();
      setFeedbacks(data.data || []);
    } catch {
      showToast('Failed to load feedbacks. Is the server running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') fetchFeedbacks();
  }, [activeTab]);

  const validate = () => {
    const e = {};
    if (!form.studentName.trim()) e.studentName = 'Name is required';
    if (!form.courseName.trim()) e.courseName = 'Course is required';
    if (!form.rating) e.rating = 'Please select a rating';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Feedback submitted successfully!');
        setForm({ studentName: '', courseName: '', rating: 0, comments: '' });
        setErrors({});
        setHoveredStar(0);
      } else {
        showToast(data.message || 'Submission failed', 'error');
      }
    } catch {
      showToast('Server error. Make sure backend is running.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      const res = await fetch(`${API_BASE}/feedback/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(prev => prev.filter(f => f._id !== id));
        showToast('Feedback deleted.');
      }
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  const ratingDist = [5,4,3,2,1].map(r => ({
    star: r,
    count: feedbacks.filter(f => f.rating === r).length
  }));

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0d0f14;
          --surface: #161820;
          --surface2: #1e2028;
          --border: #2a2d38;
          --accent: #7c6af7;
          --accent2: #e85d75;
          --gold: #f5c842;
          --text: #e8eaf0;
          --muted: #7b7f92;
          --green: #3ecf8e;
          --red: #e85d75;
          --radius: 14px;
          --font-head: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          min-height: 100vh;
        }
        .app {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }
        /* Header */
        .header {
          margin-bottom: 40px;
        }
        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(124,106,247,0.12);
          border: 1px solid rgba(124,106,247,0.3);
          border-radius: 100px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .header h1 {
          font-family: var(--font-head);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(135deg, var(--text) 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }
        .header p {
          color: var(--muted);
          font-size: 15px;
          font-weight: 300;
          letter-spacing: 0.01em;
        }
        /* Tabs */
        .tabs {
          display: flex;
          gap: 4px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 4px;
          margin-bottom: 32px;
          width: fit-content;
        }
        .tab {
          padding: 10px 28px;
          border-radius: 10px;
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          color: var(--muted);
          background: transparent;
          letter-spacing: 0.03em;
        }
        .tab.active {
          background: var(--accent);
          color: #fff;
          box-shadow: 0 4px 20px rgba(124,106,247,0.35);
        }
        /* Form */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          margin-bottom: 20px;
        }
        .card-title {
          font-family: var(--font-head);
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-title span {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--accent);
          display: inline-block;
        }
        .field { margin-bottom: 20px; }
        label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        input, textarea {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 13px 16px;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus, textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(124,106,247,0.15);
        }
        input.err, textarea.err { border-color: var(--red); }
        textarea { resize: vertical; min-height: 90px; }
        .error-msg { color: var(--red); font-size: 12px; margin-top: 5px; }
        /* Stars */
        .stars {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: transform 0.15s;
          color: var(--border);
        }
        .star-btn:hover { transform: scale(1.2); }
        .star-btn.lit { color: var(--gold); }
        .star-label {
          margin-left: 10px;
          font-size: 13px;
          color: var(--muted);
          align-self: center;
        }
        /* Submit button */
        .btn-primary {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, var(--accent), #9c6af7);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 6px 24px rgba(124,106,247,0.3);
          margin-top: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(124,106,247,0.45);
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        /* Stats row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px 24px;
          text-align: center;
        }
        .stat-num {
          font-family: var(--font-head);
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          color: var(--muted);
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }
        /* Rating bar */
        .rating-dist { margin-bottom: 28px; }
        .rating-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .rating-row-label {
          font-size: 12px;
          color: var(--muted);
          width: 16px;
          text-align: right;
          font-weight: 600;
        }
        .bar-bg {
          flex: 1;
          height: 6px;
          background: var(--surface2);
          border-radius: 100px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--gold));
          border-radius: 100px;
          transition: width 0.6s ease;
        }
        .bar-count { font-size: 12px; color: var(--muted); width: 20px; }
        /* Feedback cards */
        .feedback-list { display: flex; flex-direction: column; gap: 14px; }
        .feedback-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px 24px;
          transition: border-color 0.2s;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feedback-card:hover { border-color: rgba(124,106,247,0.35); }
        .fc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .fc-name {
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }
        .fc-course {
          font-size: 13px;
          color: var(--muted);
          margin-top: 2px;
        }
        .fc-stars { display: flex; gap: 2px; color: var(--gold); }
        .fc-comments {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
          margin-top: 10px;
          font-style: italic;
          border-left: 2px solid var(--border);
          padding-left: 12px;
        }
        .fc-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }
        .fc-date { font-size: 12px; color: var(--muted); }
        .delete-btn {
          background: rgba(232,93,117,0.1);
          border: 1px solid rgba(232,93,117,0.2);
          color: var(--red);
          border-radius: 8px;
          padding: 5px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          background: rgba(232,93,117,0.2);
          border-color: rgba(232,93,117,0.4);
        }
        /* Empty state */
        .empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty p { font-size: 15px; }
        /* Toast */
        .toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 14px 22px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          z-index: 1000;
          animation: toastIn 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          max-width: 340px;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast.success {
          background: rgba(62,207,142,0.15);
          border: 1px solid rgba(62,207,142,0.3);
          color: var(--green);
        }
        .toast.error {
          background: rgba(232,93,117,0.15);
          border: 1px solid rgba(232,93,117,0.3);
          color: var(--red);
        }
        /* Loading */
        .spinner {
          display: inline-block;
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Grid layout for two columns */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 560px) {
          .two-col { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: 1fr; }
        }
        /* MERN badge */
        .tech-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .tech-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tb-m { background: rgba(62,207,142,0.12); color: var(--green); border: 1px solid rgba(62,207,142,0.25); }
        .tb-e { background: rgba(124,106,247,0.12); color: var(--accent); border: 1px solid rgba(124,106,247,0.25); }
        .tb-r { background: rgba(100,180,255,0.12); color: #64b4ff; border: 1px solid rgba(100,180,255,0.25); }
        .tb-n { background: rgba(245,200,66,0.12); color: var(--gold); border: 1px solid rgba(245,200,66,0.25); }
        .section-divider {
          height: 1px;
          background: var(--border);
          margin: 28px 0;
        }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .refresh-btn {
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 8px;
          padding: 7px 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .refresh-btn:hover { border-color: var(--accent); color: var(--accent); }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-badge">🎓 Academic Portal</div>
          <h1>Student Feedback System</h1>
          <p>Collect, manage and analyze course feedback from students</p>
        </div>

        {/* Tech stack badges */}
        <div className="tech-row">
          <span className="tech-badge tb-m">MongoDB</span>
          <span className="tech-badge tb-e">Express.js</span>
          <span className="tech-badge tb-r">React</span>
          <span className="tech-badge tb-n">Node.js</span>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
            Submit Feedback
          </button>
          <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
            View All
          </button>
        </div>

        {/* SUBMIT TAB */}
        {activeTab === 'submit' && (
          <div className="card">
            <div className="card-title"><span/>Submit Your Feedback</div>

            <div className="two-col">
              <div className="field">
                <label>Student Name</label>
                <input
                  className={errors.studentName ? 'err' : ''}
                  placeholder="e.g. Arjun Sharma"
                  value={form.studentName}
                  onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                />
                {errors.studentName && <div className="error-msg">{errors.studentName}</div>}
              </div>
              <div className="field">
                <label>Course Name</label>
                <input
                  className={errors.courseName ? 'err' : ''}
                  placeholder="e.g. Data Structures"
                  value={form.courseName}
                  onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))}
                />
                {errors.courseName && <div className="error-msg">{errors.courseName}</div>}
              </div>
            </div>

            <div className="field">
              <label>Rating</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="stars">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      className={`star-btn ${(hoveredStar || form.rating) >= s ? 'lit' : ''}`}
                      onClick={() => { setForm(f => ({ ...f, rating: s })); setErrors(e => ({ ...e, rating: undefined })); }}
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      {starIcon((hoveredStar || form.rating) >= s)}
                    </button>
                  ))}
                </div>
                <span className="star-label">
                  {(hoveredStar || form.rating) ? ['','Poor','Fair','Good','Great','Excellent'][hoveredStar || form.rating] : 'Click to rate'}
                </span>
              </div>
              {errors.rating && <div className="error-msg">{errors.rating}</div>}
            </div>

            <div className="field">
              <label>Comments <span style={{ color: 'var(--muted)', textTransform: 'none', letterSpacing: 0, fontSize: '11px' }}>(optional)</span></label>
              <textarea
                placeholder="Share your experience with this course..."
                value={form.comments}
                onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
              />
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading && <span className="spinner"/>}
              {submitLoading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {/* VIEW TAB */}
        {activeTab === 'view' && (
          <>
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-num">{feedbacks.length}</div>
                <div className="stat-label">Total Responses</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{avgRating}</div>
                <div className="stat-label">Avg Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{new Set(feedbacks.map(f => f.courseName)).size}</div>
                <div className="stat-label">Courses</div>
              </div>
            </div>

            {/* Rating distribution */}
            {feedbacks.length > 0 && (
              <div className="card rating-dist">
                <div className="card-title"><span/>Rating Breakdown</div>
                {ratingDist.map(({ star, count }) => (
                  <div key={star} className="rating-row">
                    <div className="rating-row-label">{star}</div>
                    <div style={{ color: 'var(--gold)', fontSize: '13px' }}>★</div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: feedbacks.length ? `${(count / feedbacks.length) * 100}%` : '0%' }}/>
                    </div>
                    <div className="bar-count">{count}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback list */}
            <div className="view-header">
              <div className="card-title" style={{ margin: 0 }}><span/>All Feedback</div>
              <button className="refresh-btn" onClick={fetchFeedbacks}>
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty"><div className="spinner" style={{ borderTopColor: 'var(--accent)' }}/></div>
            ) : feedbacks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📭</div>
                <p>No feedback submitted yet. Be the first!</p>
              </div>
            ) : (
              <div className="feedback-list">
                {feedbacks.map(f => (
                  <div key={f._id} className="feedback-card">
                    <div className="fc-top">
                      <div>
                        <div className="fc-name">{f.studentName}</div>
                        <div className="fc-course">📚 {f.courseName}</div>
                      </div>
                      <div className="fc-stars">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ opacity: s <= f.rating ? 1 : 0.2, fontSize: '16px' }}>★</span>
                        ))}
                      </div>
                    </div>
                    {f.comments && (
                      <div className="fc-comments">{f.comments}</div>
                    )}
                    <div className="fc-bottom">
                      <div className="fc-date">{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <button className="delete-btn" onClick={() => handleDelete(f._id)}>
                        {trashIcon} Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
