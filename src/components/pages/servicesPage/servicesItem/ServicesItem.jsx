import './servicesItem.scss';
import { useState, useEffect } from 'react';
import { getCat } from '../../../services/service';

const ServicesItem = () => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		getCat('services')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(p => ({
					id: p.id,
					title: p.acf?.services_title,
					descr: p.acf?.services_descr,
					price: p.acf?.services_price,
					img: p.acf?.services_img,
					color: p.acf?.services_color,
				}));
				setItems(mapped);
			})
			.catch(console.error);
	}, []);

	return (
		<>
		{items.map(i => {
			const isDark = i.color === "dark";
			const cardStyle = isDark ? {backgroundImage: i.img ? `url(${i.img})` : undefined} : undefined;

			return (
				<div
					key={i.id}
					className={`services__items ${isDark ? "dark" : ""}`}
					style={cardStyle}
				>
					<div className="services__items-item">
						<h2 className="item-title">{i.title}</h2>
						<p className="item-descr">{i.descr}</p>
						{i.price ? <span className="item-price">₴{i.price}</span> : ''}
					</div>
				</div>
			);
		})}
		</>
	);
};

export default ServicesItem;
