import { lazy } from 'react';

const PromoPage = lazy(() => import('./promoPage/PromoPage'));
const ServicesPage = lazy(() => import('./servicesPage/ServicesPage'));
const AboutPage = lazy(() => import('./aboutPage/AboutPage'));

export { 
	PromoPage,
	ServicesPage,
	AboutPage,
};
