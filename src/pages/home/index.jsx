import React from 'react';
import HeroScene from '@/components/HeroScene';
import TokyoHero from '@/components/TokyoHero';
import TextRevealSection from '@/components/TextRevealSection';
import TreeSection from '@/components/TreeSection';
import WorksSection from '@/components/WorksSection';
import ContactSection from '@/components/ContactSection';

const Home = () => {
    return (
        <div className="relative w-full">
            <HeroScene />
            <TextRevealSection />
            <TreeSection />
            <WorksSection />
            <TokyoHero />
            <ContactSection />
        </div>
    );
};

export default Home;
