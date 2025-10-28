import './servicesItem.scss';
import { useState, useEffect } from 'react';
import { getCat } from '../../../services/service';

const ServicesItem = ({className}) => {
	const [services, setServices] = useState([]);

	useEffect(() => {
		getCat('services')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(p => ({
					id: p.id,
					title: p.acf?.services_title,
					descr: p.acf?.services_descr,
					price: p.acf?.services_price,
					color: p.acf?.services_color,
				}));
				setServices(mapped);})
			.catch(console.error);
	}, []);

	return (
		<>
			{services.map(s => (
				<div className={`services__items ${s.color === "dark" ? "dark" : ""}`}>
				<div className="services__items-item" key={s.id}>
					<h2 className="item-title">{s.title}</h2>
					<p className="item-descr">{s.descr}</p>
					<span className="item-price">{s.price} ₴</span>
				</div>
				</div>
			))}
		</>
	);
};

export default ServicesItem;