import './portfolioSlider.scss';
import { useEffect, useState } from 'react';
import { getCat } from "../../../services/service";
import { Swiper, SwiperSlide } from "swiper/react";

const PortfolioSlider = () => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		getCat('portfolio_slider')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(p => ({
					id: p.id,
					alt: p.slug,
					img: p.acf?.portfolio_photo,
					link: p.acf?.portfolio_link,
				}));
				setItems(mapped);})
			.catch(console.error);
	}, []);

	return (
		<Swiper
			slidesPerView={1}
			spaceBetween={20}
			speed={500}
			loop={false}
			className="portfolio__slider"
		>
		{items.map((i) => (
			<SwiperSlide key={i.id} className="portfolio__slider-slide">
				<img
					src={i.img}
					alt={i.alt}
					loading="lazy"
					className="portfolio__slider-item"
				/>
			</SwiperSlide>
		))}
		</Swiper>
	);
}

export default PortfolioSlider;