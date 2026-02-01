import PageCard from '../components/PageCard.jsx';

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl">Welcome</h1>
      <p className="font-sans">Welcome to the Innovation Collaboration Hub – a workspace where project teams turn ideas into reality through shared tools and insights. This site provides a creative sandbox and knowledge centre for innovators to explore new solutions, track project progress, and learn together. Whether you’re kicking off a fresh initiative or refining an ongoing project, you’ll find interactive tools, guided frameworks, and community-curated lessons to support your journey. Dive in to discover prototypes, resources, and collaborative spaces that help bring big ideas to life in a practical, step-by-step way.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mt-4">
        <PageCard>Explore project portfolios.</PageCard>
        <PageCard>Try interactive tools.</PageCard>
        <PageCard>Browse our learning hub.</PageCard>
      </div>
    </div>
  );
}
