const CONFIG = {
  NASA_API_KEY: 'RTDRwKq5Pd31MdgDUXGTYqTGyIPdnQIoRhAEbhbc',
  NEOWS_BASE: 'https://api.nasa.gov/neo/rest/v1/feed',
  SBDB_BASE: 'https://ssd-api.jpl.nasa.gov/cad.api',
  SENTRY_BASE: 'https://ssd-api.jpl.nasa.gov/sentry.api',
  // JPL endpoints block file:// null-origin requests; proxy them via corsproxy.io
  // (also works when deployed to GitHub Pages without the proxy)
  JPL_PROXY: 'https://api.allorigins.win/raw?url=',
  LUNAR_DISTANCE_KM: 384400,
  EARTH_CIRCUMFERENCE_KM: 40075,
  NYC_LONDON_KM: 5570,
};
