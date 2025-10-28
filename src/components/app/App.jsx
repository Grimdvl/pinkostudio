import './app.scss';
import { useEffect } from 'react';
import { getResources } from '../services/service.js';
import {
    PromoPage,
	ServicesPage,
} from '../pages';

const App = () => {
	useEffect(() => {
    getResources('media?search=logo&per_page=1&_fields=source_url')
		.then(list => {
			const href = list[0].source_url;
			const link = document.querySelector("link[rel='icon']") || document.createElement('link');
			link.rel = 'icon';
			link.href = href;
			if (href.endsWith('.svg')) link.type = 'image/svg+xml';
			document.head.appendChild(link);
		});
	}, []);

	return (
		<div className="app">
			<PromoPage />
			<ServicesPage />
		</div>
	);
}

export default App;

