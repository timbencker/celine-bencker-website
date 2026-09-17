import ContactView from './ContactView.astro';
import CvView from './CvView.astro';
import HomeView from './HomeView.astro';
import PublicationsView from './PublicationsView.astro';
import ResearchView from './ResearchView.astro';
import TalksMediaView from './TalksMediaView.astro';

/**
 * One view per translationKey. Every page is registered; each view owns its
 * own file. A translationKey missing here falls back to DraftView.
 *
 * A module rather than a constant in `src/pages/[locale]/[...slug].astro`:
 * `getStaticPaths` cannot see variables declared in the component body, and
 * it needs the list of keys to check that no page body goes unrendered.
 */
export const VIEWS = {
  home: HomeView,
  research: ResearchView,
  publications: PublicationsView,
  cv: CvView,
  'talks-media': TalksMediaView,
  contact: ContactView,
} as const;
