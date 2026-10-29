import "./socials.scss";
import { useState, useEffect } from 'react';
import { getCat } from '../services/service.js';

const Socials = () => {
	// Кожен запис категорії socials містить посилання та HTML-код іконки з ACF.
	const [items, setItems] = useState([]);

	useEffect(() => {
		getCat('socials')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(post => ({
					id: post.id,
					alt: post.slug,
					link: post.acf?.social_link,
					img: post.acf?.social_img,
				}));

				setItems(mapped);
			})
			.catch(console.error);
	}, []);

	// Узгоджуємо класи Boxicons із підключеною версією бібліотеки.
	// Наприклад, bxl bx-whatsapp перетворюється на bx bxl-whatsapp.
	const getIconClasses = (tag, classes, extraClass) => {
		const tokens = classes.trim().split(/\s+/);

		if (tag.toLowerCase() === 'i' && tokens[0] === 'bxl') {
			const iconClass = tokens.find(token => /^(?:bx|bxl)-[a-z0-9-]+$/i.test(token));
			const iconName = iconClass ? iconClass.split('-').slice(1).join('-') : '';
			const otherClasses = tokens.filter(token => !/^(?:bx|bxl)(?:-[a-z0-9-]+)?$/i.test(token));
			const iconClasses = ['bx', iconName ? `bxl-${iconName}` : 'bxl', ...otherClasses, extraClass];

			return iconClasses.filter(Boolean).join(' ').replace(/\s+/g, ' ');
		}

		return [classes, extraClass].filter(Boolean).join(' ');
	};

	// Додаємо клас стилів до іконки з WordPress, зберігаючи її HTML та атрибути.
	const addClass = (html, extraClass) => {
		if (!html || typeof html !== 'string') return '';

		return html.replace(/^<([a-zA-Z-]+)([^>]*)>/, (match, tag, attrs) => {
			const hasClass = /\sclass\s*=/.test(attrs);

			if (!hasClass) {
				return `<${tag}${attrs} class="${extraClass}">`;
			}

			const updatedAttrs = attrs.replace(/class=(['"])(.*?)\1/, (classMatch, quote, classes) => {
				const iconClasses = getIconClasses(tag, classes, extraClass);

				return `class=${quote}${iconClasses}${quote}`;
			});

			return `<${tag}${updatedAttrs}>`;
		});
	};

	return (
		<div className="socials">
			{/* Показуємо всі соцмережі, які додані до категорії у WordPress. */}
			{items.map(item => (
				<a
					key={item.id}
					className="socials__item"
					href={item.link}
					aria-label={item.alt}
					target="_blank"
					rel="noreferrer"
					dangerouslySetInnerHTML={{
						__html: addClass(item.img, 'socials__item-icon')
					}}
				/>
			))}
		</div>
	);
};

export default Socials;
