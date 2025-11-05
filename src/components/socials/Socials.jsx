import "./socials.scss";
import { useState, useEffect } from 'react';
import { getCat } from '../services/service.js';

const Socials = () => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		getCat('socials')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(p => ({
					id: p.id,
					alt: p.slug,
					link: p.acf?.social_link,
					img: p.acf?.social_img,
				}));
				setItems(mapped);})
			.catch(console.error);
	}, []);

	const addClass = (html, extraClass) => {
		if (!html || typeof html !== 'string') return '';
		return html.replace(
		/^<([a-zA-Z-]+)([^>]*)>/,
			(match, tag, attrs) => {
				const hasClass = /\sclass\s*=/.test(attrs);
				if (hasClass) {
					return `<${tag}${attrs.replace(
						/class=(['"])(.*?)\1/,
						(m, q, v) => {
							if (tag.toLowerCase() === 'i') {
								const tokens = v.trim().split(/\s+/);
								const first = tokens[0];
								if (first === 'bxl') {
									const tok = tokens.find(t => /^(?:bx|bxl)-[a-z0-9-]+$/i.test(t));
									const suffix = tok ? tok.split('-').slice(1).join('-') : '';
									const rest = tokens.filter(t => !/^(?:bx|bxl)(?:-[a-z0-9-]+)?$/i.test(t));
									const rebuilt = ['bx', suffix ? `bxl-${suffix}` : 'bxl', ...rest, extraClass]
									.filter(Boolean)
									.join(' ')
									.replace(/\s+/g, ' ');
									return `class=${q}${rebuilt}${q}`;
								}
							}
							return `class=${q}${[v, extraClass].filter(Boolean).join(' ')}${q}`;
							}
					)}>`;
				}
				return `<${tag}${attrs} class="${extraClass}">`;
			}
		);
	};

	return (
		<div className="socials">
			{items.map(i => (
				<a
					key={i.id}
					className="socials__item"
					href={i.link}
					alt={i.alt}
					target="_blank"
					rel="noreferrer"
					dangerouslySetInnerHTML={{
					__html: addClass(i.img, 'socials__item-icon')
					}}
				>
				</a>
			))}
		</div>
	);
}

export default Socials;