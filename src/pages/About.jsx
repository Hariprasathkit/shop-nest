import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const About = () => {
  return (
    <motion.div 
      className="page about-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="content-container">
        <h1>About <span className="highlight">ShopNest</span></h1>
        <p className="lead">We are passionate about delivering the best shopping experience with premium quality products.</p>
        <div className="grid-features">
          <motion.div className="feature-card" whileHover={{ y: -5, borderColor: "rgba(99,102,241,0.5)" }}>
            <h3>Premium Quality</h3>
            <p>Every item is carefully selected and vetted for highest quality standards.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ y: -5, borderColor: "rgba(99,102,241,0.5)" }}>
            <h3>Fast Shipping</h3>
            <p>We pride ourselves on getting your orders to your doorstep as quickly as possible.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ y: -5, borderColor: "rgba(99,102,241,0.5)" }}>
            <h3>24/7 Support</h3>
            <p>Our dedicated support team is always ready to assist you anytime, anywhere.</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
