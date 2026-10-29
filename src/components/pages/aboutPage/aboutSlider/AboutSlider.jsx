import "./aboutSlider.scss";
import { useState, useEffect } from 'react';
import { getCat } from '../../../services/service';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar, FreeMode, Mousewheel } from 'swiper/modules';

const AboutSlider = () => {
	const [items, setItems] = useState([]);

	// Кожен запис категорії about_slider стає окремим фото слайдера.
	useEffect(() => {
		getCat('about_slider')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(post => ({
					id: post.id,
					alt: post.slug,
					img: post.acf?.about_img,
				}));

				setItems(mapped);
			})
			.catch(console.error);
	}, []);

	return (
		<Swiper
			modules={[Scrollbar, FreeMode, Mousewheel]}
			scrollbar={{ draggable: true }}
			slidesPerView="auto"
			freeMode={{ enabled: true, momentum: false }}
			spaceBetween={20}
			speed={350}
			loop={false}
			mousewheel={{ sensitivity: 3, releaseOnEdges: true }}
			direction="horizontal"
			className="about__slider"
		>
			{items.map(item => (
				<SwiperSlide key={item.id} className="about__slider-slide">
					<img
						src={item.img}
						alt={item.alt}
						loading="lazy"
						className="about__slider-item"
					/>
				</SwiperSlide>
			))}
		</Swiper>
	);
};

export default AboutSlider;
