/**
 * The grid the CV groups share from md (board 7b): heading column 3fr, rows
 * 9fr, 48px apart. Each CvGroup spans both columns as a subgrid. The heading
 * column is at least as wide as the longest heading word.
 */
export const cvGroupsGrid =
  'md:grid md:grid-cols-[minmax(min-content,3fr)_minmax(0,9fr)] md:gap-x-12';
