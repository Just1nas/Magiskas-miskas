export const logicalSlide = (index, count) => ((index % count) + count) % count;
export function nearestSlide(positions, left) {
  return positions.reduce((best, position, index) => Math.abs(position-left)<Math.abs(positions[best]-left)?index:best,0);
}
export function restingSlide(index,count,loop) {
  return loop ? count+logicalSlide(index,count) : logicalSlide(index,count);
}
