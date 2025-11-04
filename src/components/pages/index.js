import { lazy } from 'react';

const PromoPage = lazy(() => import('./promoPage/PromoPage'));
const ServicesPage = lazy(() => import('./servicesPage/ServicesPage'));
const AboutPage = lazy(() => import('./aboutPage/AboutPage'));
const TeamPage = lazy(() => import('./teamPage/TeamPage'));

export { 
	PromoPage,
	ServicesPage,
	AboutPage,
	TeamPage,
};
