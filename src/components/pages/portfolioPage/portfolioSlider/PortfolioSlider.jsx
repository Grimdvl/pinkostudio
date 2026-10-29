import './portfolioSlider.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCat, wordpressRestRoot } from "../../../services/service";
import InstagramEmbed, { InstagramSlide, normalizeInstagramUrl } from './InstagramEmbed';
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from 'swiper/modules';
import 'swiper/css';

// Збережені медіадані повертають попередній вигляд шести дописів без налаштованого API.
// Список карток завжди визначає WordPress: цей об’єкт самостійно слайдів не додає.
const savedPosts = {
	"https://www.instagram.com/p/DJ3oIc4NRMg/": {
		"img": "/media/instagram/DJ3oIc4NRMg/image-01.jpg",
		"caption": "Готуємо дівчат до визначних подій року🥳\n\n-випускні\n-весілля\n Чекаємо тебе у PINKO_STUDI",
		"username": "pinko_studi",
		"timestamp": "2025-05-20",
		"mediaType": "IMAGE",
		"media": [
			{
				"id": "3636551726748996384",
				"type": "image",
				"url": "/media/instagram/DJ3oIc4NRMg/image-01.jpg",
				"alt": "Фото 1 з допису @pinko_studi"
			}
		]
	},
	"https://www.instagram.com/p/DDpBvSJAmzL/": {
		"img": "/media/instagram/DDpBvSJAmzL/image-01.jpg",
		"caption": "Макіяж , який ти точно захочеш вигуляти і не сидіти вдома - роблять лише у нас в PINKO студії🩷",
		"username": "pinko_studi",
		"timestamp": "2024-12-16",
		"mediaType": "IMAGE",
		"media": [
			{
				"id": "3524355830734548171",
				"type": "image",
				"url": "/media/instagram/DDpBvSJAmzL/image-01.jpg",
				"alt": "Фото 1 з допису @pinko_studi"
			}
		]
	},
	"https://www.instagram.com/p/DDAc0fog9mc/": {
		"img": "/media/instagram/DDAc0fog9mc/poster-01.jpg",
		"caption": "Макіяж від майстра Дарини. У дописі — про впевненість у собі завдяки макіяжу й укладці та запрошення до студії.",
		"username": "pinko_studi",
		"timestamp": "2024-11-30",
		"mediaType": "VIDEO",
		"media": [
			{
				"id": "3512934462029814172",
				"type": "video",
				"url": "/media/instagram/DDAc0fog9mc/video-01.mp4",
				"alt": "Відео з допису @pinko_studi",
				"poster": "/media/instagram/DDAc0fog9mc/poster-01.jpg"
			}
		],
		"captionIsSummary": true
	},
	"https://www.instagram.com/p/DGyQt7UAhFO/": {
		"img": "/media/instagram/DGyQt7UAhFO/poster-01.jpg",
		"caption": "Ідеальний погляд! 💐 Ламінування вій для справжньої весняної королеви 🌸 Даруйте собі красу та впевненість цієї весни🧚🏼‍♂️",
		"username": "anka_kuzmenko",
		"timestamp": "2025-03-04",
		"mediaType": "VIDEO",
		"media": [
			{
				"id": "3580998178520043854",
				"type": "video",
				"url": "/media/instagram/DGyQt7UAhFO/video-01.mp4",
				"alt": "Відео з допису @anka_kuzmenko",
				"poster": "/media/instagram/DGyQt7UAhFO/poster-01.jpg"
			}
		]
	},
	"https://www.instagram.com/p/DHy1LbJA2tA/": {
		"img": "/media/instagram/DHy1LbJA2tA/image-01.jpg",
		"caption": "Ідеальні бровки у нас в pinko_studi зробить тобі @targanchuk_brows 🥹🩷",
		"username": "pinko_studi",
		"timestamp": "2025-03-29",
		"mediaType": "CAROUSEL_ALBUM",
		"media": [
			{
				"id": "3599172926521257170",
				"type": "image",
				"url": "/media/instagram/DHy1LbJA2tA/image-01.jpg",
				"alt": "Фото 1 з допису @pinko_studi"
			},
			{
				"id": "3599172926622135585",
				"type": "image",
				"url": "/media/instagram/DHy1LbJA2tA/image-02.jpg",
				"alt": "Фото 2 з допису @pinko_studi"
			},
			{
				"id": "3599172926580132437",
				"type": "image",
				"url": "/media/instagram/DHy1LbJA2tA/image-03.jpg",
				"alt": "Фото 3 з допису @pinko_studi"
			}
		]
	},
	"https://www.instagram.com/p/DJ6n3OhsFU5/": {
		"img": "/media/instagram/DJ6n3OhsFU5/image-01.jpg",
		"caption": "•УЛЬТРА ІДЕАЛЬНИЙ МАНІКЮР•. \nзможеш отримати лише в нас🫶🏽\n\nТут ідеально ВСЕ, без обробки 😍",
		"username": "pinko_studi",
		"timestamp": "2025-05-21",
		"mediaType": "CAROUSEL_ALBUM",
		"media": [
			{
				"id": "3637394961821958562",
				"type": "image",
				"url": "/media/instagram/DJ6n3OhsFU5/image-01.jpg",
				"alt": "Фото 1 з допису @pinko_studi"
			},
			{
				"id": "3637394961805131751",
				"type": "image",
				"url": "/media/instagram/DJ6n3OhsFU5/image-02.jpg",
				"alt": "Фото 2 з допису @pinko_studi"
			}
		]
	}
};

const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

const getMediaUrl = path => {
	if (typeof path !== 'string' || !path.startsWith('/media/instagram/')) return path;
	return `${publicUrl}${path}`;
};

const extractHashtags = (caption = '') => {
	const hashtags = caption.match(/#[\p{L}\p{M}\p{N}_]+/gu) || [];
	return [...new Set(hashtags)];
};

// Готуємо однакові дані картки для збереженого допису та відповіді API.
const createInstagramItem = (url, values = {}) => {
	const normalizedUrl = normalizeInstagramUrl(url);
	if (!normalizedUrl) return null;

	const providedValues = Object.entries(values).filter(([, value]) => value !== undefined);
	const item = {
		id: `instagram-${normalizedUrl.split('/')[4]}`,
		alt: 'Допис Instagram',
		img: '',
		caption: '',
		media: [],
		...savedPosts[normalizedUrl],
		...Object.fromEntries(providedValues),
		url: normalizedUrl,
	};

	item.img = getMediaUrl(item.img);
	item.media = (Array.isArray(item.media) ? item.media : []).map(media => ({
		...media,
		url: getMediaUrl(media.url),
		poster: getMediaUrl(media.poster),
	}));
	item.hashtags = extractHashtags(item.caption);

	return item;
};

// Нові посилання можуть отримати власні медіа через встановлений серверний плагін.
const getInstagramPost = async (url, signal) => {
	const endpoint = new URL(`${wordpressRestRoot}/pinkostudio/v1/instagram`);
	endpoint.searchParams.set('url', url);
	const res = await fetch(endpoint, { signal });

	if (!res.ok) throw new Error(`Instagram API: ${res.status}`);

	const post = await res.json();
	if (!post || typeof post !== 'object' || typeof post.img !== 'string' || !post.img) {
		throw new Error('Instagram API не повернув зображення');
	}

	const caption = typeof post.caption === 'string' ? post.caption : '';
	return createInstagramItem(url, {
		img: post.img,
		alt: caption || 'Допис Instagram',
		caption,
		username: post.username,
		timestamp: post.timestamp,
		mediaType: post.mediaType,
		media: Array.isArray(post.media) ? post.media : [],
	});
};

const transitionDuration = 1000;
const autoplayDelay = 10000;
const desktopSlider = {
	slidesPerView: 3,
	loopAdditionalSlides: 0,
};
const sliderBreakpoints = {
	768: { ...desktopSlider, spaceBetween: 30 },
	992: { ...desktopSlider, spaceBetween: 70 },
	1200: { ...desktopSlider, spaceBetween: 100 },
};

// Копія попереднього слайда плавно зникає поверх нового.
const createOutgoingFrame = element => {
	const frame = element.cloneNode(true);
	frame.removeAttribute('id');
	frame.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
	const images = element.querySelectorAll('img');
	frame.querySelectorAll('img').forEach((image, index) => {
		if (images[index]?.currentSrc) image.src = images[index].currentSrc;
		image.loading = 'eager';
	});

	// Беремо стоп-кадр, зберігаючи позицію справжнього відео.
	const videos = element.querySelectorAll('video');
	frame.querySelectorAll('video').forEach((video, index) => {
		const source = videos[index];
		let still;
		if (source?.readyState >= 2 && source.videoWidth && source.videoHeight) {
			const canvas = document.createElement('canvas');
			const scale = Math.min(1, 1000 / source.videoWidth);
			canvas.width = Math.round(source.videoWidth * scale);
			canvas.height = Math.round(source.videoHeight * scale);
			try {
				const context = canvas.getContext('2d');
				if (context) {
					context.drawImage(source, 0, 0, canvas.width, canvas.height);
					still = canvas;
				}
			} catch {
				// Якщо кадр недоступний, нижче використаємо обкладинку.
			}
		}
		if (!still) {
			still = document.createElement(source?.poster ? 'img' : 'div');
			if (source?.poster) still.src = source.poster;
		}
		still.className = video.className;
		video.replaceWith(still);
	});
	// Для анімації не завантажуємо ще одну копію Instagram iframe.
	frame.querySelectorAll('iframe').forEach(iframe => {
		const placeholder = document.createElement('div');
		placeholder.className = 'portfolio__instagram-preview';
		iframe.replaceWith(placeholder);
	});
	return frame;
};

const PortfolioSlider = () => {
	const [items, setItems] = useState([]);
	const [slider, setSlider] = useState(null);
	const [isLocked, setIsLocked] = useState(false);
	const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
	const [activeInstagramId, setActiveInstagramId] = useState(null);
	const outgoingFrame = useRef(null);
	const transitionLocked = useRef(false);
	const unlockTimer = useRef(null);

	useEffect(() => {
		let cancelled = false;
		const controller = new AbortController();
		let requestTimer;

		getCat('portfolio_slider')
			.catch(error => {
				console.error(error);
				return [];
			})
			.then(posts => {
				if (cancelled) return;
				const mapped = (Array.isArray(posts) ? posts : [])
					.map(post => {
						const instagramUrl = normalizeInstagramUrl(post?.acf?.portfolio_link)
							|| normalizeInstagramUrl(post?.acf?.portfolio_instagram_url);
						return instagramUrl
							? createInstagramItem(instagramUrl, { id: post.id, alt: post.slug })
							: null;
					})
					.filter(Boolean);
				setItems(mapped);

				// Для нових посилань пробуємо отримати медіа через серверний API.
				const instagramUrls = [...new Set(mapped.map(item => item.url))]
					.filter(url => !savedPosts[url]);
				if (!instagramUrls.length) return;
				requestTimer = window.setTimeout(() => controller.abort(), 20000);
				Promise.allSettled(instagramUrls.map(url => getInstagramPost(url, controller.signal)))
					.then(results => {
						if (cancelled) return;
						const resolved = new Map(results
							.filter(result => result.status === 'fulfilled')
							.map(result => [result.value.url, result.value]));
						setItems(current => current.map(item => resolved.has(item.url)
							? { ...item, ...resolved.get(item.url), id: item.id }
							: item));
					})
					.finally(() => window.clearTimeout(requestTimer));
			});

		return () => {
			// Після виходу з секції відповіді мережі вже не змінюють слайди.
			cancelled = true;
			controller.abort();
			window.clearTimeout(requestTimer);
		};
	}, []);

	useEffect(() => {
		return () => {
			window.clearTimeout(unlockTimer.current);
		};
	}, []);

	const finishTransition = useCallback(() => {
		if (!transitionLocked.current) return;
		window.clearTimeout(unlockTimer.current);
		outgoingFrame.current?.replaceChildren();
		transitionLocked.current = false;
		setIsLocked(false);
	}, []);

	const changeSlide = useCallback(direction => {
		if (!slider || transitionLocked.current) return;
		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) {
			direction === 'next' ? slider.slideNext(0) : slider.slidePrev(0);
			return;
		}

		// До завершення згасання блокуємо повторне перемикання.
		transitionLocked.current = true;
		if (slider.el && outgoingFrame.current) {
			outgoingFrame.current.replaceChildren(createOutgoingFrame(slider.el));
		}
		setIsLocked(true);
		direction === 'next' ? slider.slideNext(0) : slider.slidePrev(0);

		unlockTimer.current = window.setTimeout(finishTransition, transitionDuration);
	}, [finishTransition, slider]);

	useEffect(() => {
		// Під час наведення, анімації або відкритого допису автопрокрутка чекає.
		if (!slider || items.length < 2 || isAutoplayPaused || isLocked || activeInstagramId !== null) return;

		const autoplayTimer = window.setTimeout(() => {
			changeSlide('next');
		}, autoplayDelay);

		return () => window.clearTimeout(autoplayTimer);
	}, [activeInstagramId, changeSlide, isAutoplayPaused, isLocked, items.length, slider]);

	const instagramItems = items;
	const activeInstagramIndex = instagramItems.findIndex(item => item.id === activeInstagramId);
	const activeInstagram = instagramItems[activeInstagramIndex];
	const navigateInstagram = direction => {
		const index = (activeInstagramIndex + direction + instagramItems.length) % instagramItems.length;
		setActiveInstagramId(instagramItems[index].id);
	};

	if (!items.length) return null;

	return (
		<div
			className={`portfolio__slider-shell${isLocked ? ' is-locked' : ''}`}
			style={{ '--portfolio-transition-duration': `${transitionDuration}ms` }}
			onMouseEnter={() => setIsAutoplayPaused(true)}
			onMouseLeave={() => setIsAutoplayPaused(false)}
		>
			<div className={`portfolio__slider-stage${isLocked ? ' is-transitioning' : ''}`}>
				<Swiper
					modules={[A11y]}
					onSwiper={setSlider}
					onResize={finishTransition}
					onBreakpoint={finishTransition}
					loop={items.length >= 5}
					loopAdditionalSlides={1}
					allowTouchMove={false}
					centeredSlides
					breakpoints={sliderBreakpoints}
					className="portfolio__slider"
				>
					{items.map(item => (
						<SwiperSlide key={item.id} className="portfolio__slider-slide">
							<InstagramSlide
								item={item}
								disabled={isLocked}
								isModalOpen={activeInstagramId !== null}
								onOpen={() => setActiveInstagramId(item.id)}
							/>
						</SwiperSlide>
					))}
				</Swiper>
				<div className="portfolio__slider-outgoing" ref={outgoingFrame} aria-hidden="true" inert />
			</div>

			{items.length > 1 && (
				<>
					<button
						type="button"
						className="portfolio__slider-arrow portfolio__slider-arrow--prev"
						aria-label="Попередній слайд"
						disabled={isLocked}
						onClick={() => changeSlide('prev')}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M15 4 7 12l8 8" />
						</svg>
					</button>
					<button
						type="button"
						className="portfolio__slider-arrow portfolio__slider-arrow--next"
						aria-label="Наступний слайд"
						disabled={isLocked}
						onClick={() => changeSlide('next')}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="m9 4 8 8-8 8" />
						</svg>
					</button>
				</>
			)}
			{activeInstagram && (
				<InstagramEmbed
					item={activeInstagram}
					onClose={() => setActiveInstagramId(null)}
					onPrevious={() => navigateInstagram(-1)}
					onNext={() => navigateInstagram(1)}
					hasNavigation={instagramItems.length > 1}
				/>
			)}
		</div>
	);
};

export default PortfolioSlider;
