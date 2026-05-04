import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiArrowRight, FiEye, FiStar, FiClock, FiArrowDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ExperimentCard = ({ experiment }) => {
  return (
    <div className="glass-panel experiment-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge">
          <FiCode style={{ display: 'inline', marginRight: '0.25rem' }} />
          {experiment.technology}
        </span>
        {experiment.difficulty && (
          <span className={`badge ${experiment.difficulty === 'Beginner' ? 'badge-success' : experiment.difficulty === 'Intermediate' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.8rem' }}>
            {experiment.difficulty}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{experiment.title}</h3>
      <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {experiment.observations || 'No observations recorded yet.'}
      </p>

      {/* Mini Performance Chart Mockup */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '30px', marginBottom: '1.5rem', opacity: 0.8 }}>
        {[40, 70, 45, 90, 60].map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ width: '12px', background: 'var(--accent-primary)', borderRadius: '2px 2px 0 0' }}
          />
        ))}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '8px', paddingBottom: '2px' }}>Perf. Metric</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiEye /> {experiment.views || 0}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}><FiStar /> {experiment.upvotes || 0}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}><FiArrowDown /> {experiment.downvotes || 0}</span>
        {experiment.timeTaken && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock /> {experiment.timeTaken}</span>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Link to={`/experiment/${experiment._id}`} className="btn btn-secondary text-sm" style={{ width: '100%' }}>
          View Details <FiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default ExperimentCard;
