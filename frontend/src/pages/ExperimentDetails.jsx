import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiCode, FiEye, FiStar, FiClock, FiCopy, FiCheck, FiArrowDown, FiEdit } from 'react-icons/fi';

const CodeSnippet = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'relative', background: '#1e1e1e', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button onClick={handleCopy} className="btn" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
      <pre style={{ margin: 0, overflowX: 'auto', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.9rem' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const RenderContent = ({ content }) => {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="rich-text" style={{ lineHeight: '1.6' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^[a-z]+\n/, ''); 
          return <CodeSnippet key={index} code={code.trim()} />;
        }
        return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </div>
  );
};

const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await api.get(`/experiments/${id}`);
        setExperiment(response.data);
      } catch (error) {
        console.error('Failed to fetch experiment details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiment();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      try {
        await api.delete(`/experiments/${id}`);
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete experiment', error);
      }
    }
  };

  const handleUpvote = async () => {
    try {
      const response = await api.post(`/experiments/${id}/upvote`);
      setExperiment(response.data);
    } catch (error) {
      console.error('Failed to upvote experiment', error);
    }
  };

  const handleDownvote = async () => {
    try {
      const response = await api.post(`/experiments/${id}/downvote`);
      setExperiment(response.data);
    } catch (error) {
      console.error('Failed to downvote experiment', error);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  if (!experiment) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Experiment not found</div>;

  return (
    <div className="container main-content" style={{ maxWidth: '900px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
              <FiArrowLeft />
            </Link>
            <h1 className="text-gradient" style={{ margin: 0 }}>{experiment.title}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/edit/${id}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiEdit /> Edit
            </Link>
            <button onClick={handleDelete} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                <FiCode style={{ display: 'inline', marginRight: '0.5rem' }} />
                {experiment.technology}
              </span>
              {experiment.difficulty && (
                <span className={`badge ${experiment.difficulty === 'Beginner' ? 'badge-success' : experiment.difficulty === 'Intermediate' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.9rem' }}>
                  {experiment.difficulty}
                </span>
              )}
              {experiment.tags && experiment.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {experiment.tags.map(tag => (
                    <span key={tag} className="badge" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiEye /> {experiment.views} Views</span>
              {experiment.timeTaken && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiClock /> {experiment.timeTaken}</span>
              )}
              <button onClick={handleUpvote} className="btn" style={{ background: 'rgba(255,200,0,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,200,0,0.3)', padding: '0.25rem 0.75rem' }}>
                <FiStar /> {experiment.upvotes} Upvote
              </button>
              <button onClick={handleDownvote} className="btn" style={{ background: 'rgba(255,100,100,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,100,100,0.3)', padding: '0.25rem 0.75rem' }}>
                <FiArrowDown /> {experiment.downvotes || 0} Downvote
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {experiment.setupSteps && (
              <details style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-glass)' }} open>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Setup Steps</summary>
                <div style={{ marginTop: '1rem' }}><RenderContent content={experiment.setupSteps} /></div>
              </details>
            )}
            
            {experiment.observations && (
              <details style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-glass)' }} open>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Observations</summary>
                <div style={{ marginTop: '1rem' }}><RenderContent content={experiment.observations} /></div>
              </details>
            )}

            {experiment.errorsFaced && (
              <details style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-glass)' }} open>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>❗ Errors Faced</summary>
                <div style={{ marginTop: '1rem' }}><RenderContent content={experiment.errorsFaced} /></div>
              </details>
            )}

            {experiment.solutionsDiscovered && (
              <details style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-glass)' }} open>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-hover)', marginBottom: '0.5rem' }}>✅ Solutions Discovered</summary>
                <div style={{ marginTop: '1rem' }}><RenderContent content={experiment.solutionsDiscovered} /></div>
              </details>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExperimentDetails;
