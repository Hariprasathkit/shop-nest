import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div 
      className="page home-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <header className="hero">
        <div className="hero-content">
          <motion.h1 variants={itemVariants}>
            Discover Your Next <span className="highlight">Favorite Thing</span>
          </motion.h1>
          <motion.p variants={itemVariants}>
            Explore our curated collection of premium products designed to elevate your everyday life.
          </motion.p>
          <motion.div className="hero-actions" variants={itemVariants}>
            <motion.button 
              className="btn primary-btn" 
              onClick={() => navigate('/products')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Now
            </motion.button>
            <motion.button 
              className="btn secondary-btn"
              onClick={() => navigate('/products')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Collections
            </motion.button>
          </motion.div>
        </div>
      </header>
    </motion.div>
  );
};

export default Home;
