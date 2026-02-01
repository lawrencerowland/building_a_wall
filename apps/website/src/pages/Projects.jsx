import PageCard from '../components/PageCard.jsx';
import DecisionGateBadge from '../components/DecisionGateBadge.jsx';

export default function Projects() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl">Projects Portfolio</h1>
      <p className="font-sans">Our Innovation Projects Portfolio highlights the diverse range of initiatives our teams are exploring. Each project below represents a novel idea – from process improvements to new digital tools – being prototyped and tested in a real-world context. Browse through the project cards to see a brief summary of each initiative’s goal and current status. You can select any project to view its dedicated page, where the team shares their approach, progress, and key learnings. This portfolio is updated regularly, inviting you to follow along and even contribute feedback as these projects evolve. By presenting all projects side by side, this page helps our community celebrate progress and spot opportunities for collaboration across different innovation efforts.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
        <PageCard>
          Project Alpha <DecisionGateBadge gate="G3" />
        </PageCard>
        <PageCard>
          Project Beta <DecisionGateBadge gate="G1" />
        </PageCard>
      </div>
    </div>
  );
}
