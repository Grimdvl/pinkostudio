import "./servicesItem.scss";
import { useState, useEffect } from 'react';
import { getCat } from '../../../services/service';

const ServicesItem = () => {
	const [items, setItems] = useState([]);

	// Беремо всі картки послуг із категорії services, включно з фото, ціною та кольором.
	useEffect(() => {
		getCat('services')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(post => ({
					id: post.id,
					title: post.acf?.services_title,
					descr: post.acf?.services_descr,
					price: post.acf?.services_price,
					img: post.acf?.services_img,
					color: post.acf?.services_color,
				}));

				setItems(mapped);
			})
			.catch(console.error);
	}, []);

	return (
		<>
			{items.map(item => {
				// Фото тлом використовується тільки для темної картки.
				const isDark = item.color === 'dark';
				const cardStyle = isDark ? { backgroundImage: item.img ? `url(${item.img})` : undefined } : undefined;

				return (
					<div
						key={item.id}
						className={`services__items ${isDark ? 'dark' : ''}`}
						style={cardStyle}
					>
						<div className="services__items-item">
							<h2 className="item-title">{item.title}</h2>
							<p className="item-descr">{item.descr}</p>
							{item.price ? <span className="item-price">₴{item.price}</span> : ''}
						</div>
					</div>
				);
			})}
		</>
	);
};

export default ServicesItem;
