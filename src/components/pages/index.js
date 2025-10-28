import { lazy } from 'react';

const PromoPage = lazy(() => import('./promoPage/PromoPage'));
const ServicesPage = lazy(() => import('./servicesPage/ServicesPage'));

export { 
	PromoPage,
	ServicesPage,
};
