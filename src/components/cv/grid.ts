/**
 * The grid the CV groups share from desktop (board 7b): heading column 3fr,
 * rows 9fr, 48px apart. Each CvGroup spans both columns as a subgrid. The
 * heading column is at least as wide as the longest heading word. Below
 * desktop the groups stack (tiers: src/lib/styles.ts).
 */
export const cvGroupsGrid =
  'desktop:grid desktop:grid-cols-[minmax(min-content,3fr)_minmax(0,9fr)] desktop:gap-x-12';
