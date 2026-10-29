import { lazy } from 'react';

// lazy завантажує код секції окремо. Кожен із цих файлів має export default.
const PromoPage = lazy(() => import('./promoPage/PromoPage'));
const ServicesPage = lazy(() => import('./servicesPage/ServicesPage'));
const AboutPage = lazy(() => import('./aboutPage/AboutPage'));
const TeamPage = lazy(() => import('./teamPage/TeamPage'));
const PortfolioPage = lazy(() => import('./portfolioPage/PortfolioPage'));
const ContactPage = lazy(() => import('./contactPage/ContactPage'));

export {
	PromoPage,
	ServicesPage,
	AboutPage,
	TeamPage,
	PortfolioPage,
	ContactPage,
};
