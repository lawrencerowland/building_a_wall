# Innovation Collaboration Hub

This repository now hosts a lightweight, static HTML website for the Innovation Collaboration Hub. The site focuses on a handful of core sections and keeps everything serverless so the pages can be hosted directly on GitHub Pages.

## Platform Sections

- **Home – Welcome & Overview** – Introductory page that welcomes users and explains the platform’s mission and structure in general terms.
- **Projects Portfolio** – Directory of all innovation projects with brief summaries, allowing users to explore and navigate to individual project pages.
- **Contracts as Algebras Sandbox** – A conceptual playground explaining how adjoints can support project management trade-offs.
- **AI Tools & Collaboration** – Showcases AI-assisted features for project work and collaboration.
- **Systems Thinking & Stakeholders** – Guides users in applying a systems-thinking lens to map stakeholder networks and decision processes.
- **Project Lifecycle & Governance** – Provides a generic project lifecycle framework with governance checkpoints.
- **Insights & Learning Hub** – Repository of shared knowledge, case studies, and lessons learned.

## Project Structure

- `index.html` – Home page for the hub.
- `projects/`, `sandbox/`, `ai-tools/`, `systems/`, `lifecycle/`, `insights/` – Section pages with their own `index.html` files.
- `common.css` – Shared styling for typography, navigation, cards, and layout.

## Design & Style Guidelines

- Use the shared `common.css` stylesheet with a relative path in every page.
- Include a viewport meta tag and design layouts responsively.
- Keep asset paths relative (avoid leading `/`) so the site works on GitHub Pages.
- Embed any small datasets inline so pages open without a server.

## Deploying to GitHub Pages

Push your changes to the **main** branch and enable GitHub Pages in the repo settings using *Deploy from branch* with the root folder. The site will then be available at:

```
https://<org>.github.io/<repo>/
```

## License

This project is licensed under the [MIT License](LICENSE).
