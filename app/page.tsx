import About from "@/components/About";
import Contact from "@/components/Contact";
import GitHubActivity from "@/components/GitHubActivity";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <GitHubActivity />
      <Contact />
    </>
  );
}
