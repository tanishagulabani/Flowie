import type { SupplyFilter } from '../types';

// Map supply filter chips to OSM amenity/shop tags
const FILTER_TAGS: Record<SupplyFilter, string[]> = {
  pads: ['amenity=pharmacy', 'shop=chemist', 'shop=supermarket', 'shop=convenience'],
  tampons: ['amenity=pharmacy', 'shop=chemist', 'shop=supermarket', 'shop=convenience'],
  cups: ['amenity=pharmacy', 'shop=chemist'],
  pain_relief: ['amenity=pharmacy', 'shop=chemist'],
  pregnancy_tests: ['amenity=pharmacy', 'shop=chemist', 'shop=supermarket'],
};

function tagToOverpass(tag: string): string {
  const [k, v] = tag.split('=');
  return `node["${k}"="${v}"]`;
}

export function buildOverpassQuery(
  lat: number,
  lon: number,
  radiusMetres: number,
  filters: SupplyFilter[]
): string {
  const activeTags = new Set<string>();
  const activeFilters = filters.length > 0 ? filters : (Object.keys(FILTER_TAGS) as SupplyFilter[]);
  activeFilters.forEach(f => FILTER_TAGS[f].forEach(t => activeTags.add(t)));

  const nodeQueries = [...activeTags]
    .map(t => `  ${tagToOverpass(t)}(around:${radiusMetres},${lat},${lon});`)
    .join('\n');

  return `
[out:json][timeout:25];
(
${nodeQueries}
);
out body;
`.trim();
}
