import MatomoTracker from '@datapunt/matomo-tracker-js';

const Matomo = new MatomoTracker({
  urlBase: 'https://matomo.thedrhax.pw/',
  siteId: 6,
});

export default Matomo;
