import React, { useEffect, useState } from 'react';

function FeedbackForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadSubmissions = () => {
    setLoading(true);
    setFetchError(null);
    fetch('/feedback')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch feedback');
        return r.json();
      })
      .then((data) => setSubmissions(data))
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const validate = () => {
    const errs = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!message || message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);
    fetch('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || 'Submission failed'); });
        return r.json();
      })
      .then(() => {
        setEmail('');
        setMessage('');
        setErrors({});
        loadSubmissions();
      })
      .catch((e) => setSubmitError(e.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="feedback-section">
      <h2>Feedback</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="feedback-email">Email</label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="feedback-message">Message</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message (min 10 characters)"
            rows={4}
          />
          {errors.message && <span className="field-error">{errors.message}</span>}
        </div>
        {submitError && <p className="submit-error">{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>

      <h3>Past Submissions</h3>
      {loading && <p>Loading…</p>}
      {fetchError && <p className="submit-error">Error: {fetchError}</p>}
      {!loading && !fetchError && submissions.length === 0 && <p>No submissions yet.</p>}
      {!loading && !fetchError && submissions.length > 0 && (
        <ul className="submissions-list">
          {submissions.map((s) => (
            <li key={s.id}>
              <strong>{s.email}</strong>: {s.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FeedbackForm;
