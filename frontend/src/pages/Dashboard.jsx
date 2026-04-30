import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import ExperimentCard from '../components/ExperimentCard';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [experiments, setExperiments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExperiments();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);

      const response = await api.get(`/experiments?${params.toString()}`);
      setExperiments(response.data);
    } catch (error) {
      console.error('Failed to fetch experiments', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Please login to view your dashboard.</div>;
  }

  return (
    <div className="container main-content">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}
      >
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Your Experiments</h1>
          <p className="text-muted">Document and track your learning journey.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search experiments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading experiments...</div>
      ) : experiments.length > 0 ? (
        <motion.div 
          className="experiment-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {experiments.map(exp => (
            <ExperimentCard key={exp._id} experiment={exp} />
          ))}
        </motion.div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>No experiments found</h3>
          <p className="text-muted">Start documenting your first learning experiment!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
