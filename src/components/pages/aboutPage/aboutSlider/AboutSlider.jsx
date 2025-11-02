import "./aboutSlider.scss";
import { useState, useEffect } from 'react'
import { getCat } from "../../../services/service";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, FreeMode, Mousewheel  } from "swiper/modules";

const AboutSlider = () => {
	const [items, setItems] = useState([])

	useEffect(() => {
		getCat('about_slider')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(p => ({
					id: p.id,
					alt: p.slug,
					img: p.acf?.about_img,
				}));
				setItems(mapped);})
			.catch(console.error);
	}, []);

	return (
		<Swiper
			modules={[Scrollbar, FreeMode, Mousewheel ]}
			scrollbar={{ draggable: true }}
			slidesPerView={'auto'}
			freeMode={{ enabled: true, momentum: false }}
			spaceBetween={20}
			speed={500}
			loop={false}
			mousewheel={{ sensitivity: 2, releaseOnEdges: true}}
			direction="horizontal"
			className="about__slider"
		>
		{items.map((i) => (
			<SwiperSlide key={i.id} className="about__slider-slide">
				<img
					src={i.img}
					alt={i.alt}
					loading="lazy"
					className="about__slider-item"
				/>
			</SwiperSlide>
		))}
		</Swiper>
	);
};

export default AboutSlider;
