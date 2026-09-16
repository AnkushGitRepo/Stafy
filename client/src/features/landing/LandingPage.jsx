import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ApprovalsFlow } from './components/ApprovalsFlow.jsx';
import { Demo } from './components/Demo.jsx';
import { Faq } from './components/Faq.jsx';
import { Footer } from './components/Footer.jsx';
import { Header } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { ProductBento } from './components/ProductBento.jsx';
import { RolesSection } from './components/RolesSection.jsx';
import { RulesSection } from './components/RulesSection.jsx';
import { SecuritySection } from './components/SecuritySection.jsx';

gsap.registerPlugin(ScrollTrigger, Flip);

export function LandingPage() {
  return (
    <div>
      <Header />
      <main id="main">
        <Hero />
        <RolesSection />
        <ProductBento />
        <RulesSection />
        <ApprovalsFlow />
        <SecuritySection />
        <Demo />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
