import './servicesItem.scss';
import { useState, useEffect } from 'react';
import { getCat } from '../../../services/service';

const ServicesItem = () => {
	const [services, setServices] = useState([]);

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
				setServices(mapped);
			})
			.catch(console.error);
	}, []);

	return (
		<>
			{services.map(s => {
				const isDark = s.color === "dark";

				const cardStyle = isDark ? {backgroundImage: s.img ? `url(${s.img})` : undefined} : undefined;

				return (
					<div
						key={s.id}
						className={`services__items ${isDark ? "dark" : ""}`}
						style={cardStyle}
					>
						<div className="services__items-item">
							<h2 className="item-title">{s.title}</h2>
							<p className="item-descr">{s.descr}</p>
							{s.price ? <span className="item-price">₴{s.price}</span> : ''}
						</div>
					</div>
				);
			})}
		</>
	);
};

export default ServicesItem;
