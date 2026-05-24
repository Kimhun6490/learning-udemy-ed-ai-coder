import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { DigitalTwin } from "@/components/DigitalTwin";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Portfolio } from "@/components/Portfolio";
import { Stats } from "@/components/Stats";
import { TechMarquee } from "@/components/TechMarquee";

export default function Home() {
  return (
    <div className="noise relative min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <TechMarquee />
        <Stats />
        <About />
        <Journey />
        <Portfolio />
        <DigitalTwin />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
