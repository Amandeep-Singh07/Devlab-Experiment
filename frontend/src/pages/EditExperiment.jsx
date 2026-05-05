import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiEdit } from 'react-icons/fi';

const EditExperiment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    technology: '',
    difficulty: 'Beginner',
    tags: '',
    timeTaken: '',
    setupSteps: '',
    observations: '',
    errorsFaced: '',
    solutionsDiscovered: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await api.get(`/experiments/${id}`);
        const data = response.data;
        setFormData({
          title: data.title || '',
          technology: data.technology || '',
          difficulty: data.difficulty || 'Beginner',
          tags: data.tags ? data.tags.join(', ') : '',
          timeTaken: data.timeTaken || '',
          setupSteps: data.setupSteps || '',
          observations: data.observations || '',
          errorsFaced: data.errorsFaced || '',
          solutionsDiscovered: data.solutionsDiscovered || ''
        });
      } catch (error) {
        console.error('Failed to fetch experiment details', error);
        alert('Failed to load experiment data.');
      } finally {
        setFetching(false);
      }
    };
    fetchExperiment();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.put(`/experiments/${id}`, payload);
      navigate(`/experiment/${id}`);
    } catch (error) {
      console.error('Failed to update experiment', error);
      alert('Failed to update experiment.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading experiment data...</div>;
  }

  return (
    <div className="container main-content" style={{ maxWidth: '800px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to={`/experiment/${id}`} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <FiArrowLeft />
          </Link>
          <h1 className="text-gradient">Edit Experiment</h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Setting up Redux Toolkit" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Technology</label>
            <input name="technology" value={formData.technology} onChange={handleChange} required placeholder="e.g., React, Node.js" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Time Taken</label>
              <input name="timeTaken" value={formData.timeTaken} onChange={handleChange} placeholder="e.g., 2 hours, 3 days" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., UI, Performance, State Management" />
          </div>

          <div className="form-group">
            <label className="form-label">Setup Steps (Markdown/Text)</label>
            <textarea name="setupSteps" value={formData.setupSteps} onChange={handleChange} rows="4" placeholder="How did you set it up?"></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Observations</label>
            <textarea name="observations" value={formData.observations} onChange={handleChange} rows="4" placeholder="What did you learn?"></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Errors Faced</label>
            <textarea name="errorsFaced" value={formData.errorsFaced} onChange={handleChange} rows="3" placeholder="Any blockers?"></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Solutions Discovered</label>
            <textarea name="solutionsDiscovered" value={formData.solutionsDiscovered} onChange={handleChange} rows="3" placeholder="How did you fix them?"></textarea>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', fontSize: '1.1rem' }}>
            <FiSave /> {loading ? 'Saving...' : 'Update Experiment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditExperiment;
