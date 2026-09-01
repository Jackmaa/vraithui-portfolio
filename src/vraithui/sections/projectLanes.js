/**
 * The two render lanes for the projects section.
 *
 * A project is FEATURED when it has an image or a video, and COMPACT when it
 * has neither. `image: null` is therefore meaningful data rather than a defect
 * to paper over: most repositories have no screenshot, and fabricating a
 * placeholder for them makes the grid look broken rather than making the
 * project look finished. A project graduates from the list to a card by
 * acquiring media, with no data migration.
 *
 * Input order is preserved in both lanes. The order of projects.<locale>.json
 * is authored, not derived, so nothing here may sort it.
 */

export function hasMedia(project) {
  return Boolean(project && (project.image || project.video));
}

export function partitionByMedia(projects) {
  const featured = [];
  const compact = [];
  for (const project of projects ?? []) {
    (hasMedia(project) ? featured : compact).push(project);
  }
  return { featured, compact };
}
