import { lazy } from 'react';

const PromoPage = lazy(() => import('./promoPage/PromoPage'));
const ServicesPage = lazy(() => import('./servicesPage/ServicesPage'));
const AboutPage = lazy(() => import('./aboutPage/AboutPage'));
const TeamPage = lazy(() => import('./teamPage/TeamPage'));
const PortfolioPage = lazy(() => import('./portfolioPage/PortfolioPage'));

export { 
	PromoPage,
	ServicesPage,
	AboutPage,
	TeamPage,
	PortfolioPage,
};
