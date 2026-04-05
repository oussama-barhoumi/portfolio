import React from 'react';
import HeroScene from '@/components/HeroScene';
import TextRevealSection from '@/components/TextRevealSection';
import TreeSection from '@/components/TreeSection';
import WorksSection from '@/components/WorksSection';

const Home = () => {
    return (
        <div className="relative w-full">
            <HeroScene />
            <TextRevealSection />
            <TreeSection />
            <WorksSection />
        </div>
    );
};

export default Home;
