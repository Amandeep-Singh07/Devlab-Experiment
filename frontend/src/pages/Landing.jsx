import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { FiCode, FiLayers, FiZap, FiArrowRight } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';

const Landing = () => {
  const { user, loading } = useContext(AuthContext);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="landing-page">
      <div className="hero-section">
        <motion.div 
          className="container hero-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="badge" variants={itemVariants}>
            <span className="badge-pulse"></span>
            Welcome to the future of learning
          </motion.div>
          <motion.h1 className="hero-title" variants={itemVariants}>
            Document, Discover, and Share <br/>
            <span className="text-gradient">Your Coding Experiments</span>
          </motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>
            DevLab is your personal laboratory for tracking development projects, noting down solutions, and building a comprehensive knowledge base of your coding journey.
          </motion.p>
          <motion.div className="hero-actions" variants={itemVariants}>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Get Started <FiArrowRight />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div id="features" className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2>Everything you need to <span className="text-gradient">level up</span></h2>
            <p>Powerful tools designed specifically for developers to keep track of their growth and learnings.</p>
          </motion.div>

          <div className="features-grid">
            {[
              {
                icon: <FiCode className="feature-icon" />,
                title: "Track Experiments",
                description: "Log your daily coding challenges, the technologies you used, and the precise steps you took to build them."
              },
              {
                icon: <FiLayers className="feature-icon" />,
                title: "Build Knowledge",
                description: "Document the errors you faced and the exact solutions you discovered, building an invaluable personal wiki."
              },
              {
                icon: <FiZap className="feature-icon" />,
                title: "Fast Discovery",
                description: "Use advanced full-text search to instantly recall past projects and solutions when you encounter familiar problems."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className="icon-wrapper">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
