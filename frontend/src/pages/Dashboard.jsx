import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import ExperimentCard from '../components/ExperimentCard';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [experiments, setExperiments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const response = await api.get('/experiments');
      setExperiments(response.data);
    } catch (error) {
      console.error('Failed to fetch experiments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchExperiments();
      return;
    }
    try {
      const response = await api.get(`/search?q=${searchQuery}`);
      setExperiments(response.data);
    } catch (error) {
      console.error('Search failed', error);
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
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search experiments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
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
