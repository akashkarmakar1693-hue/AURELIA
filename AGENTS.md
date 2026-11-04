# AURELIA

## Project

AURELIA is a futuristic luxury-real-estate web experience built with React and Vite.

The experience should feel:

- Premium
- Cinematic
- Architectural
- Minimal
- Futuristic
- Interactive
- Sophisticated

AURELIA is not a generic SaaS dashboard or template-style real-estate website.

The primary goal is to create an immersive digital experience for discovering luxury properties while maintaining excellent usability, accessibility, responsiveness, and performance.

---

## Technology Stack

Use the existing project stack:

- React
- JavaScript
- Vite
- Tailwind CSS
- GSAP
- GSAP ScrollTrigger
- Three.js
- React Three Fiber
- Drei
- React Router
- Lucide React

Do not add dependencies unless there is a clear technical reason.

Prefer the existing stack and native browser capabilities whenever possible.

---

## Core Architecture

Use a hybrid architecture.

### React / HTML

React and normal HTML should handle:

- Navigation
- Typography
- Property information
- Buttons
- Links
- Forms
- Filters
- Galleries
- Content
- Accessibility
- SEO-related structure

### Three.js / React Three Fiber

Use WebGL for:

- 3D architectural experiences
- Hero scenes
- Camera movement
- Architectural models
- Lighting
- Environment effects
- Subtle particles or depth effects

Do not put normal website content into WebGL when HTML is more appropriate.

The entire website must not become one giant WebGL canvas.

### GSAP / ScrollTrigger

Use GSAP for:

- Scroll-driven animation
- Section transitions
- Text reveals
- Parallax
- Camera timelines
- Image transitions
- UI micro-interactions

Animations must support the experience rather than exist only for decoration.

---

## Design Direction

AURELIA uses a premium architectural visual language.

Preferred:

- Obsidian / near-black surfaces
- Warm white typography
- Restrained champagne/gold accents
- Large editorial typography
- Generous whitespace
- Precise grids
- Architectural imagery
- Strong visual hierarchy
- Subtle depth
- Refined glass effects
- Cinematic transitions

Avoid:

- Generic SaaS layouts
- Excessive rounded cards
- Excessive gradients
- Excessive glow effects
- Random animations
- Visual clutter
- Cheap-looking effects
- Template-like real-estate layouts
- Unnecessary glassmorphism

---

## Component Architecture

Keep components focused and reusable.

Recommended structure:

src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── utils/
├── data/
├── three/
├── animations/
└── styles/

Use appropriate boundaries rather than creating files simply to increase the number of components.

Shared components should remain reusable.

Do not create unnecessary abstraction layers.

Before modifying a shared component, inspect where it is used.

---

## React Rules

Follow React's Rules of Hooks strictly.

- Never call hooks outside components or custom hooks.
- Never conditionally call hooks.
- Keep component state local when possible.
- Avoid unnecessary global state.
- Avoid unnecessary re-renders.
- Keep side effects inside appropriate lifecycle hooks.
- Keep data, presentation, and behavior reasonably separated.

Do not introduce a state-management library unless the application genuinely requires one.

---

## GSAP Rules

Use GSAP and ScrollTrigger consistently.

- Register plugins correctly.
- Scope animations to their owning component.
- Clean up timelines and ScrollTriggers.
- Avoid global animation instances when unnecessary.
- Avoid fragile selectors when refs can be used.
- Do not create duplicate ScrollTriggers during React re-renders.
- Respect component lifecycle.
- Avoid animation conflicts between components.
- Prefer timeline-based choreography for complex sequences.

Animations should remain functional when content or screen size changes.

Support reduced-motion preferences where appropriate.

---

## Three.js / React Three Fiber Rules

Use React Three Fiber for React-integrated 3D scenes.

- Keep 3D scenes isolated from normal UI.
- Keep scenes reusable.
- Avoid unnecessarily complex geometry.
- Optimize models, textures, lights, and materials.
- Avoid excessive draw calls.
- Avoid unnecessarily high-resolution textures.
- Use lazy loading for expensive 3D assets when appropriate.
- Dispose of resources correctly when required.
- Avoid unnecessary per-frame calculations.
- Do not use WebGL for content that HTML can handle better.
- Consider mobile GPU limitations from the beginning.

3D should provide meaningful visual value.

Do not add 3D merely because the technology is available.

---

## Animation + 3D Integration

When GSAP controls a Three.js experience:

- Keep animation ownership clear.
- Avoid multiple systems fighting over the same camera or object.
- Use refs or controlled state where appropriate.
- Keep the Three.js scene responsible for 3D rendering.
- Keep GSAP responsible for choreography and timing.
- Ensure scroll-based animation can be disabled or simplified on low-powered/mobile devices when necessary.

---

## Responsive Design

AURELIA must work across:

- Desktop
- Laptop
- Tablet
- Mobile

Do not treat mobile as an afterthought.

For complex 3D experiences, provide appropriate mobile behavior such as:

- Reduced geometry
- Reduced effects
- Simplified animations
- Lower asset quality where appropriate
- Static or simplified fallbacks when necessary

The website should remain usable even when advanced visual effects are reduced.

---

## Performance

Performance is a core requirement.

Pay attention to:

- JavaScript bundle size
- Image sizes
- 3D model sizes
- Texture sizes
- WebGL draw calls
- Animation complexity
- Layout shifts
- Unnecessary React renders
- Asset loading
- Code splitting
- Lazy loading

Do not sacrifice usability and performance simply to add visual effects.

---

## Accessibility

Maintain accessible HTML and interactions.

Ensure:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible buttons and links
- Appropriate labels
- Reasonable color contrast
- Reduced-motion support
- Meaningful alternative text for important images
- 3D content does not prevent users from accessing the underlying information

Visual sophistication must never replace accessibility.

---

## Code Quality

Write clean, maintainable JavaScript.

Prefer:

- Clear naming
- Small focused components
- Reusable utilities
- Simple logic
- Consistent formatting
- Minimal duplication

Avoid:

- Giant components
- Dead code
- Duplicate logic
- Magic values without explanation
- Unnecessary abstractions
- Temporary hacks left in production

Do not rewrite unrelated code.

---

## Dependencies

Avoid unnecessary dependencies.

Before installing a package:

1. Check whether the existing stack can solve the problem.
2. Check whether the browser can solve it natively.
3. Check whether an existing dependency already provides the required functionality.
4. Only then consider adding a new package.

Never use:

- `--force`
- `--legacy-peer-deps`

to hide dependency compatibility problems.

Fix the actual compatibility issue instead.

---

## Assets

Use high-quality architectural imagery and optimized assets.

For external assets:

- Check licensing before production use.
- Avoid relying on unstable external URLs when local assets are more appropriate.
- Optimize large images.
- Lazy-load non-critical assets.
- Use appropriate image formats.

3D assets must also be optimized for web delivery.

---

## Routing

Use React Router for application routes.

Routes should be predictable and maintainable.

Do not introduce unnecessary routing complexity.

---

## Error Handling

Do not hide errors.

When something fails:

1. Reproduce the problem.
2. Identify the root cause.
3. Fix the underlying issue.
4. Verify the fix.
5. Check for related regressions.

Do not silence errors simply to make the console look clean.

---

## Development Workflow

Before implementing a significant feature:

1. Inspect the existing project.
2. Understand the current architecture.
3. Determine which existing components can be reused.
4. Plan the implementation.
5. Implement the smallest sensible solution.
6. Test the feature.
7. Check responsive behavior.
8. Check console/build errors.
9. Review performance for animation and 3D features.

After significant changes, run:

npm run build

Do not consider a feature complete if the production build is broken.

---

## Agent Responsibilities

### Architect

Responsible for:

- Architecture
- Component boundaries
- Data flow
- Technical planning
- React / GSAP / Three.js integration strategy
- Performance architecture

The Architect should not modify files unless explicitly asked.

### Designer

Responsible for:

- UI/UX
- Visual hierarchy
- Typography
- Layout
- Responsive design
- AURELIA visual language
- Interaction concepts
- Animation direction

The Designer should not introduce unnecessary visual complexity.

### Coder

Responsible for:

- React implementation
- UI implementation
- GSAP implementation
- Three.js / R3F implementation
- Routing
- Feature integration
- Responsive implementation
- Testing changes

The Coder should follow the established architecture.

### Debugger

Responsible for:

- Root-cause investigation
- React issues
- GSAP issues
- ScrollTrigger issues
- Three.js / WebGL issues
- Build issues
- Dependency issues
- Runtime errors

The Debugger should not modify files unless explicitly asked.

### Reviewer

Responsible for:

- Code quality
- Architecture review
- Security
- Performance
- Accessibility
- React patterns
- GSAP lifecycle
- Three.js resource management
- Responsive behavior

The Reviewer should not modify files unless explicitly asked.

### Tester

Responsible for:

- Functional testing
- Regression testing
- Responsive testing
- Interaction testing
- Animation testing
- 3D/WebGL testing
- Accessibility testing
- Error-state testing

The Tester should not modify production code unless explicitly asked.

---

## General Rule

Prefer quality over quantity.

AURELIA should feel intentionally designed, not overloaded with technology.

Every component, animation, 3D element, dependency, and interaction should have a clear purpose.

Build an experience that feels like a premium architectural brand, not a collection of frontend demonstrations.
