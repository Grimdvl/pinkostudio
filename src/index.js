import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/app/App';
import './style.scss';

// Підключаємо весь React-сайт до елемента #root з public/index.html.
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
