import "./promoPage.scss";
import { useState, useEffect } from 'react';
import Logo from '../../logo/Logo.jsx';
import Header from "../../header/Header.jsx";
import { getAcf, getCat } from '../../services/service.js';

const PromoPage = () => {
	const [showNav, setShowNav] = useState(false);
	const [acf, setAcf] = useState({});
	const [items, setItems] = useState([]);

	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const { 
		promo_title,
		promo_subtitle,
		promo_button_1,
		promo_button_2,
		promo_photo,
	} = acf;

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
        <section id="promo" className="promo">
			<Header
				showNav={showNav}
				setShowNav={setShowNav}
			/>
			<div className="promo__descr">
				<Logo/>
				<h1 className="promo__descr-title">{promo_title}</h1>
				<h2 className="promo__descr-subtitle">{promo_subtitle}</h2>
				<div className="promo__descr-buttons">
					<button className="promo-btn button-booking">{promo_button_1}</button>
					<button className="promo-btn button-gift">{promo_button_2}</button>
				</div>
				<div className="promo__descr-socials">
					{items.map(i => (
						<a
							key={i.id}
							className="item"
							href={i.link}
							alt={i.alt}
							target="_blank"
							rel="noreferrer"
							dangerouslySetInnerHTML={{
							__html: addClass(i.img, 'item-icon')
							}}
						>
						</a>
					))}
				</div>
			</div>
			<div className="promo__photo">
				<Logo/>
				<img className="promo__photo-img" src={promo_photo} alt="promo-photo" />
			</div>
        </section>
    );
};

export default PromoPage;