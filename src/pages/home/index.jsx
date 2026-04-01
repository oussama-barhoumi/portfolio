import React from 'react';
import HeroScene from '@/components/HeroScene';
import TextRevealSection from '@/components/TextRevealSection';
import TreeSection from '@/components/TreeSection';

const Home = () => {
    return (
        <div className="relative w-full">
            <HeroScene />
            <TextRevealSection />
            <TreeSection />
        </div>
    );
};

export default Home;
