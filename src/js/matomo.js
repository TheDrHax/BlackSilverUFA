import MatomoTracker from '@datapunt/matomo-tracker-js';

const Matomo = new MatomoTracker({
  urlBase: 'https://matomo.thedrhax.pw/',
  siteId: 1,
});

export default Matomo;
