
import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import Projects from "./Projects";
import Alliances from "./Alliances";
import Team from "./Team";
import Closing from "./Closing";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido">
        <Hero />
        <About />
        <Projects />
        <Alliances />
        <Team />
        <Closing />
      </main>

      <Footer />
    </>
  );
}
