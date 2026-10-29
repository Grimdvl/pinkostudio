import "./app.scss";
import { useEffect } from 'react';
import { getResources } from '../services/service.js';
import {
	PromoPage,
	ServicesPage,
	AboutPage,
	TeamPage,
	PortfolioPage,
	ContactPage,
} from '../pages';

const App = () => {
	// Знаходимо логотип у медіатеці WordPress і ставимо його як іконку вкладки.
	useEffect(() => {
		getResources('media?search=logo&per_page=1&_fields=source_url')
			.then(list => {
				const href = list[0]?.source_url;
				if (!href) return;

				const link = document.querySelector("link[rel='icon']") || document.createElement('link');
				link.rel = 'icon';
				link.href = href;
				if (href.endsWith('.svg')) link.type = 'image/svg+xml';

				document.head.appendChild(link);
			})
			.catch(console.error);
	}, []);

	// Порядок компонентів тут визначає порядок секцій на сторінці.
	return (
		<main className="app">
			<PromoPage />
			<ServicesPage />
			<AboutPage />
			<TeamPage />
			<PortfolioPage />
			<ContactPage />
		</main>
	);
};

export default App;
