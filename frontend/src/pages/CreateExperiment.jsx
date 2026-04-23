import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CreateExperiment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    technology: '',
    setupSteps: '',
    observations: '',
    errorsFaced: '',
    solutionsDiscovered: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/experiments', formData);
      navigate('/');
    } catch (error) {
      console.error('Failed to create experiment', error);
      alert('Failed to save experiment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content" style={{ maxWidth: '800px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <FiArrowLeft />
          </Link>
          <h1 className="text-gradient">New Experiment</h1>
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
            <FiSave /> {loading ? 'Saving...' : 'Save Experiment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateExperiment;
