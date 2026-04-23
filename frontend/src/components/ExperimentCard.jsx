import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiArrowRight } from 'react-icons/fi';

const ExperimentCard = ({ experiment }) => {
  return (
    <div className="glass-panel experiment-card">
      <div style={{ marginBottom: '1rem' }}>
        <span className="badge">
          <FiCode style={{ display: 'inline', marginRight: '0.25rem' }} />
          {experiment.technology}
        </span>
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{experiment.title}</h3>
      <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {experiment.observations || 'No observations recorded yet.'}
      </p>
      <div style={{ marginTop: 'auto' }}>
        <Link to={`/experiment/${experiment._id}`} className="btn btn-secondary text-sm" style={{ width: '100%' }}>
          View Details <FiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default ExperimentCard;
