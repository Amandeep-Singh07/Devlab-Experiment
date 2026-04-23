import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiCode } from 'react-icons/fi';

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
        navigate('/');
      } catch (error) {
        console.error('Failed to delete experiment', error);
      }
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  if (!experiment) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Experiment not found</div>;

  return (
    <div className="container main-content" style={{ maxWidth: '900px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
              <FiArrowLeft />
            </Link>
            <h1 className="text-gradient" style={{ margin: 0 }}>{experiment.title}</h1>
          </div>
          <button onClick={handleDelete} className="btn btn-danger">
            <FiTrash2 /> Delete
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              <FiCode style={{ display: 'inline', marginRight: '0.5rem' }} />
              {experiment.technology}
            </span>
            <div className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Created on {new Date(experiment.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {experiment.setupSteps && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Setup Steps</h3>
                <div className="rich-text">{experiment.setupSteps}</div>
              </div>
            )}
            
            {experiment.observations && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Observations</h3>
                <div className="rich-text">{experiment.observations}</div>
              </div>
            )}

            {experiment.errorsFaced && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Errors Faced</h3>
                <div className="rich-text">{experiment.errorsFaced}</div>
              </div>
            )}

            {experiment.solutionsDiscovered && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-hover)' }}>Solutions Discovered</h3>
                <div className="rich-text">{experiment.solutionsDiscovered}</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExperimentDetails;
