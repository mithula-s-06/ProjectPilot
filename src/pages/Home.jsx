import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Workflow from '../components/Workflow';
import About from '../components/About';
const Home = () => {
  return (
    <main className="w-full">
      <Hero />
      <Features />
      <Workflow />
      <About />
    </main>
  );
};

export default Home;
