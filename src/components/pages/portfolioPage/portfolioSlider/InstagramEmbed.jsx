import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const normalizeInstagramUrl = (value) => {
	try {
		const link = typeof value === 'string' ? value.trim() : value?.url;
		const url = new URL(link);
		const post = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/);
		const isInstagram = ['instagram.com', 'www.instagram.com'].includes(url.hostname);

		if (url.protocol !== 'https:' || !isInstagram || !post) return null;
		if (url.username || url.password || url.port) return null;

		// Для одного допису використовуємо одне посилання без зайвих параметрів.
		return `https://www.instagram.com/${post[1]}/${post[2]}/`;
	} catch {
		return null;
	}
};

const embedTimeout = 12000;
const defaultEmbedHeight = 720;
let activePreview = null;
const previewSwitchDelay = 500;
const pendingPauses = new Map();

const cancelPendingPause = video => {
	const timer = pendingPauses.get(video);
	if (timer !== undefined) {
		window.clearTimeout(timer);
		pendingPauses.delete(video);
	}
};

// Даємо новому прев’ю пів секунди перед зупинкою попереднього.
const schedulePreviousPause = video => {
	cancelPendingPause(video);
	pendingPauses.set(video, window.setTimeout(() => {
		pendingPauses.delete(video);
		if (activePreview !== video) pauseInstagramPreview(video);
	}, previewSwitchDelay));
};

const handlePlaybackFailure = (video, previous) => {
	if (activePreview !== video) return;
	activePreview = null;
	// Якщо нове відео не запустилося, попереднє продовжує відтворення.
	if (previous && pendingPauses.has(previous)) {
		cancelPendingPause(previous);
		activePreview = previous;
	}
};

const pauseInstagramPreview = video => {
	if (!video) return;
	cancelPendingPause(video);
	video.pause();
	if (activePreview === video) activePreview = null;
};

const playInstagramPreview = video => {
	if (!video) return;
	const previous = activePreview;
	cancelPendingPause(video);
	activePreview = video;
	if (previous && previous !== video) schedulePreviousPause(previous);
	try {
		const playback = video.play();
		playback?.catch(() => {
			handlePlaybackFailure(video, previous);
		});
	} catch {
		handlePlaybackFailure(video, previous);
	}
};

// Скрипти Instagram працюють усередині iframe й не змінюють DOM слайдера.
const InstagramFrame = ({ permalink, compact }) => {
	const iframeRef = useRef(null);
	const [status, setStatus] = useState('loading');
	const [height, setHeight] = useState(defaultEmbedHeight);

	useEffect(() => {
		const timeout = window.setTimeout(() => setStatus('error'), embedTimeout);
		const handleLoad = () => {
			window.clearTimeout(timeout);
			setStatus('ready');
		};
		const handleError = () => {
			window.clearTimeout(timeout);
			setStatus('error');
		};
		const handleMessage = event => {
			// Висоту приймаємо лише від цього iframe з домену Instagram.
			if (event.origin !== 'https://www.instagram.com' ||
				!iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow ||
				typeof event.data !== 'string') return;
			try {
				const message = JSON.parse(event.data);
				const nextHeight = message?.details?.height;
				if (message?.type === 'MEASURE' && typeof nextHeight === 'number' &&
					Number.isFinite(nextHeight) && nextHeight > 0) {
					setHeight(Math.min(3000, Math.max(320, Math.ceil(nextHeight))));
				}
			} catch {
				// Інші повідомлення iframe пропускаємо.
			}
		};
		const iframe = iframeRef.current;
		iframe.addEventListener('load', handleLoad);
		iframe.addEventListener('error', handleError);
		window.addEventListener('message', handleMessage);
		return () => {
			window.clearTimeout(timeout);
			iframe.removeEventListener('load', handleLoad);
			iframe.removeEventListener('error', handleError);
			window.removeEventListener('message', handleMessage);
		};
	}, []);

	return (
		<div className={`instagram-post-embed${compact ? ' instagram-post-embed--compact' : ''}`}>
			{status === 'loading' && (
				<p className="instagram-post-embed__status" role="status">
					Завантажуємо допис Instagram…
				</p>
			)}
			{status === 'error' && (
				<p className="instagram-post-embed__status" role="status">
					Instagram не завантажив допис. Відкрийте його за посиланням нижче.
				</p>
			)}
			<div className="instagram-post-embed__frame">
				<iframe
					ref={iframeRef}
					className="instagram-post-embed__iframe"
					src={`${permalink}embed/captioned/?cr=1&v=14`}
					title="Допис Instagram"
					style={{ height }}
					loading={compact ? 'lazy' : 'eager'}
					allow="encrypted-media; picture-in-picture; fullscreen"
					allowFullScreen
				/>
			</div>
			<a
				className="instagram-post-embed__link"
				href={permalink}
				target="_blank"
				rel="noopener noreferrer"
			>
				Відкрити в Instagram <span aria-hidden="true">↗</span>
			</a>
		</div>
	);
};

export const InstagramPostEmbed = ({ url, compact = false }) => {
	const permalink = normalizeInstagramUrl(url);
	if (!permalink) {
		return <p className="instagram-post-embed__status">Посилання на допис Instagram недійсне.</p>;
	}
	return <InstagramFrame key={permalink} permalink={permalink} compact={compact} />;
};

export const InstagramSlide = ({ item, onOpen, disabled, isModalOpen = false, isVisible = true }) => {
	const [imageFailed, setImageFailed] = useState(false);
	const [videoFailed, setVideoFailed] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isInViewport, setIsInViewport] = useState(true);
	const videoRef = useRef(null);
	const cardRef = useRef(null);
	const primaryMedia = item.media?.[0];
	const isVideo = String(primaryMedia?.type).toLowerCase() === 'video';
	const videoUrl = isVideo ? primaryMedia.url : '';
	const shouldStop = isModalOpen || !isVisible || !isInViewport;
	const canPlay = !disabled && !shouldStop;

	useEffect(() => setImageFailed(false), [item.img]);
	useEffect(() => setVideoFailed(false), [videoUrl]);
	useEffect(() => {
		// Пауза зберігає позицію відео при відкритті допису або виході за екран.
		const video = videoRef.current;
		if (shouldStop) pauseInstagramPreview(video);
		return () => pauseInstagramPreview(video);
	}, [shouldStop, videoUrl]);
	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') return undefined;
		// Прев’ю зупиняється, коли видимо менше чверті картки.
		const observer = new IntersectionObserver(([entry]) => {
			setIsInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.25);
		}, { threshold: [0, 0.25] });
		observer.observe(cardRef.current);
		return () => observer.disconnect();
	}, []);

	const startPreview = () => {
		if (canPlay) playInstagramPreview(videoRef.current);
	};

	return (
		<div
			ref={cardRef}
			className={`portfolio__slider-card portfolio__instagram-card${isPlaying ? ' is-playing' : ''}`}
			onMouseEnter={startPreview}
			onFocus={startPreview}
		>
			{videoUrl && !videoFailed ? (
				<video
					key={videoUrl}
					ref={videoRef}
					src={videoUrl}
					poster={primaryMedia.poster || item.img || undefined}
					muted
					playsInline
					loop
					preload="metadata"
					className="portfolio__slider-item"
					aria-label={item.alt || 'Відео з допису Instagram'}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					onError={() => setVideoFailed(true)}
				/>
			) : item.img && !imageFailed ? (
				<img
					src={item.img}
					alt={item.alt}
					loading="lazy"
					className="portfolio__slider-item"
					onError={() => setImageFailed(true)}
				/>
			) : (
				<div className="portfolio__instagram-preview" aria-hidden="true" inert>
					<InstagramPostEmbed url={item.url} compact />
				</div>
			)}
			<button
				type="button"
				className="portfolio__instagram-open"
				onClick={onOpen}
				disabled={disabled}
				aria-haspopup="dialog"
				aria-label={`Відкрити допис Instagram${item.username ? ` @${item.username}` : ''}`}
			>
				{isVideo && (
					<span className="portfolio__instagram-play" aria-hidden="true">
						<svg viewBox="0 0 24 24">
							<path d="m9 5 11 7-11 7z" />
						</svg>
					</span>
				)}
			</button>
		</div>
	);
};

const Chevron = ({ direction }) => {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<path d={direction === 'previous' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
		</svg>
	);
};

const InstagramIcon = () => {
	return (
		<svg className="instagram-modal__instagram-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<rect x="3" y="3" width="18" height="18" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<circle className="instagram-modal__instagram-dot" cx="17.5" cy="6.5" r="1" />
		</svg>
	);
};

const getPostMedia = item => {
	const media = (item.media || []).filter(entry => entry?.url);
	if (media.length) return media;
	return item.img ? [{ id: item.id, type: 'IMAGE', url: item.img, alt: item.alt }] : [];
};

const formatPostDate = timestamp => {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return null;
	const dateOnly = typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(timestamp);
	const parts = new Intl.DateTimeFormat('uk-UA', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		...(dateOnly ? { timeZone: 'UTC' } : {}),
	}).formatToParts(date);
	const text = ['day', 'month', 'year']
		.map(type => parts.find(part => part.type === type)?.value)
		.join(' ');
	return { text, value: dateOnly ? timestamp : date.toISOString() };
};

const ModalVideo = ({ media, alt, onError }) => {
	const videoRef = useRef(null);
	const activeRef = useRef(true);
	const desiredPlayingRef = useRef(false);
	const playRequestRef = useRef(0);
	const pauseTimerRef = useRef(null);
	const statusId = useId();
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackError, setPlaybackError] = useState('');

	useEffect(() => {
		activeRef.current = true;
		const video = videoRef.current;
		return () => {
			// Закриття допису скасовує таймер і незавершений запит відтворення.
			const hadPlaybackRequest = desiredPlayingRef.current;
			activeRef.current = false;
			desiredPlayingRef.current = false;
			playRequestRef.current += 1;
			window.clearTimeout(pauseTimerRef.current);
			pauseTimerRef.current = null;
			if (video && (!video.paused || hadPlaybackRequest)) video.pause();
		};
	}, []);

	const togglePlayback = async () => {
		const video = videoRef.current;
		if (!video) return;
		setPlaybackError('');
		if (pauseTimerRef.current !== null) {
			// Повторне натискання до завершення затримки скасовує паузу.
			window.clearTimeout(pauseTimerRef.current);
			pauseTimerRef.current = null;
			return;
		}
		if (!video.paused || desiredPlayingRef.current) {
			pauseTimerRef.current = window.setTimeout(() => {
				pauseTimerRef.current = null;
				desiredPlayingRef.current = false;
				playRequestRef.current += 1;
				if (activeRef.current) video.pause();
			}, 500);
			return;
		}
		desiredPlayingRef.current = true;
		const request = ++playRequestRef.current;
		try {
			await video.play();
			// Запит play() може завершитися вже після закриття допису.
			if ((!activeRef.current || !desiredPlayingRef.current) && !video.paused) video.pause();
		} catch {
			if (activeRef.current && desiredPlayingRef.current && request === playRequestRef.current) {
				desiredPlayingRef.current = false;
				window.clearTimeout(pauseTimerRef.current);
				pauseTimerRef.current = null;
				setIsPlaying(false);
				setPlaybackError('Не вдалося відтворити відео. Спробуйте ще раз.');
			}
		}
	};

	const handlePlay = () => {
		if (!activeRef.current || !desiredPlayingRef.current) {
			videoRef.current?.pause();
			return;
		}
		setIsPlaying(true);
	};
	const handleStop = () => {
		desiredPlayingRef.current = false;
		playRequestRef.current += 1;
		window.clearTimeout(pauseTimerRef.current);
		pauseTimerRef.current = null;
		setIsPlaying(false);
	};

	return (
		<div className="instagram-modal__video">
			<video
				ref={videoRef}
				className="instagram-modal__image"
				src={media.url}
				poster={media.poster}
				playsInline
				preload="metadata"
				aria-label={alt}
				onPlay={handlePlay}
				onPause={handleStop}
				onEnded={handleStop}
				onError={onError}
			/>
			<button
				type="button"
				className={`instagram-modal__video-toggle${isPlaying ? ' instagram-modal__video-toggle--playing' : ''}`}
				aria-label={isPlaying ? 'Призупинити відео' : 'Відтворити відео'}
				aria-describedby={playbackError ? statusId : undefined}
				onClick={togglePlayback}
			>
				<span className="instagram-modal__video-play" aria-hidden="true">
					<svg viewBox="0 0 24 24" focusable="false">
						<path d="m9 5 11 7-11 7z" />
					</svg>
				</span>
			</button>
			{playbackError && (
				<p id={statusId} className="instagram-modal__video-status" role="status">
					{playbackError}
				</p>
			)}
		</div>
	);
};

const PostMedia = ({ media, index, onPrevious, onNext, caption }) => {
	const current = media[index] || media[0];
	const isCurrentPhoto = String(current.type).toUpperCase() !== 'VIDEO';
	const stageRef = useRef(null);
	const previousRef = useRef(null);
	const nextRef = useRef(null);
	const navigationFocusRef = useRef(null);
	const [failedUrls, setFailedUrls] = useState(() => new Set());

	useEffect(() => {
		// Коли крайня стрілка зникає, переводимо фокус на доступну навігацію.
		const direction = navigationFocusRef.current;
		if (!direction) return;
		navigationFocusRef.current = null;
		const target = direction === 'previous' ? previousRef.current : nextRef.current;
		(target || stageRef.current)?.focus({ preventScroll: true });
	}, [index]);

	const markFailed = url => setFailedUrls(previous => new Set(previous).add(url));
	const showPrevious = () => {
		if (index <= 0) return;
		if (index === 1) navigationFocusRef.current = 'next';
		onPrevious();
	};
	const showNext = () => {
		if (index >= media.length - 1) return;
		if (index === media.length - 2) navigationFocusRef.current = 'previous';
		onNext();
	};

	return (
		<div className={`instagram-modal__media${isCurrentPhoto ? ' instagram-modal__media--photo' : ''}`}>
			<div
				ref={stageRef}
				className="instagram-modal__media-stage"
				role="group"
				aria-roledescription={media.length > 1 ? 'карусель' : undefined}
				aria-label="Медіа допису Instagram"
				tabIndex={-1}
			>
				{media.map((entry, slideIndex) => {
					const isActive = slideIndex === index;
					const isVideo = String(entry.type).toUpperCase() === 'VIDEO';
					const alt = entry.alt || caption?.split('\n')[0] || 'Фото з допису Instagram';
					return (
						<div
							key={`${entry.id || slideIndex}:${entry.url}`}
							className={`instagram-modal__media-slide${isActive ? ' is-active' : ''}`}
							style={{ transform: `translateX(${(slideIndex - index) * 100}%)` }}
							role="group"
							aria-roledescription="слайд"
							aria-label={`Медіа ${slideIndex + 1} з ${media.length}`}
							aria-hidden={!isActive}
							inert={!isActive}
						>
							{failedUrls.has(entry.url) ? (
								<p className="instagram-modal__media-error" role={isActive ? 'status' : undefined}>
									Не вдалося завантажити медіа. Відкрийте допис в Instagram.
								</p>
							) : isVideo ? (
								isActive ? (
									<ModalVideo media={entry} alt={alt} onError={() => markFailed(entry.url)} />
								) : entry.poster ? (
									<img className="instagram-modal__image instagram-modal__photo" src={entry.poster} alt="" />
								) : (
									<div className="instagram-modal__video-placeholder" />
								)
							) : (
								<img
									className="instagram-modal__image instagram-modal__photo"
									src={entry.url}
									alt={alt}
									loading={Math.abs(slideIndex - index) <= 1 ? 'eager' : 'lazy'}
									onError={() => markFailed(entry.url)}
								/>
							)}
						</div>
					);
				})}
			</div>
			{index > 0 && (
				<button
					ref={previousRef}
					type="button"
					className="instagram-modal__media-arrow instagram-modal__media-arrow--previous"
					aria-label="Попереднє фото або відео в дописі"
					onClick={showPrevious}
				>
					<Chevron direction="previous" />
				</button>
			)}
			{index < media.length - 1 && (
				<button
					ref={nextRef}
					type="button"
					className="instagram-modal__media-arrow instagram-modal__media-arrow--next"
					aria-label="Наступне фото або відео в дописі"
					onClick={showNext}
				>
					<Chevron direction="next" />
				</button>
			)}
			{media.length > 1 && (
				<span className="instagram-modal__sr-only" role="status" aria-live="polite">
					Медіа {index + 1} з {media.length}
				</span>
			)}
		</div>
	);
};

const InstagramEmbed = ({ item, onClose, onPrevious, onNext, hasNavigation = false }) => {
	const dialogRef = useRef(null);
	const contentRef = useRef(null);
	const titleRef = useRef(null);
	const previouslyFocusedRef = useRef(document.activeElement);
	const pointerStartedOnBackdrop = useRef(false);
	const titleId = useId();
	// Якщо є фото чи відео, показуємо власну галерею навіть без підпису.
	const media = useMemo(() => getPostMedia(item), [item]);
	const [mediaIndex, setMediaIndex] = useState(0);
	const activeMediaIndex = mediaIndex < media.length ? mediaIndex : 0;
	const permalink = normalizeInstagramUrl(item.url);
	const username = item.username?.replace(/^@/, '') || '';
	const date = formatPostDate(item.timestamp);
	const extraHashtags = (item.hashtags || [])
		.map(tag => `#${String(tag).replace(/^#/, '')}`)
		.filter(tag => !item.caption?.includes(tag));

	useEffect(() => setMediaIndex(0), [item.id, item.url]);
	useEffect(() => {
		// Блокуємо прокрутку сторінки та повертаємо фокус після закриття.
		const dialog = dialogRef.current;
		const previousActiveElement = previouslyFocusedRef.current;
		const previousOverflow = document.body.style.overflow;
		dialog.showModal();
		document.body.style.overflow = 'hidden';
		if (dialog.classList.contains('instagram-modal--custom')) {
			titleRef.current?.focus({ preventScroll: true });
		}
		if (contentRef.current) contentRef.current.scrollTop = 0;
		dialog.scrollTop = 0;
		return () => {
			if (dialog.open) dialog.close();
			document.body.style.overflow = previousOverflow;
			if (previousActiveElement instanceof HTMLElement && previousActiveElement.isConnected) {
				previousActiveElement.focus({ preventScroll: true });
			}
		};
	}, []);

	const handleKeyDown = event => {
		if (!hasNavigation || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		// Стрілки у кнопках, полях і відеоплеєрі залишаються за самим елементом.
		if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, video, iframe, [contenteditable="true"], [role="button"]')) return;
		if (event.key === 'ArrowLeft' && onPrevious) {
			event.preventDefault();
			onPrevious();
		} else if (event.key === 'ArrowRight' && onNext) {
			event.preventDefault();
			onNext();
		}
	};
	const navigation = hasNavigation && (
		<nav className="instagram-modal__post-navigation" aria-label="Навігація між дописами">
			<button type="button" onClick={onPrevious} disabled={!onPrevious} aria-label="Попередній допис">
				<Chevron direction="previous" />
			</button>
			<button type="button" onClick={onNext} disabled={!onNext} aria-label="Наступний допис">
				<Chevron direction="next" />
			</button>
		</nav>
	);
	const closeButton = (
		<button
			type="button"
			className={`instagram-modal__close${media.length ? ' instagram-modal__close--header' : ''}`}
			aria-label="Закрити допис"
			onClick={onClose}
			autoFocus={!media.length}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="m6 6 12 12M18 6 6 18" />
			</svg>
		</button>
	);
	return createPortal(
		<dialog
			ref={dialogRef}
			className={`instagram-modal${media.length ? ' instagram-modal--custom' : ''}`}
			aria-labelledby={titleId}
			onKeyDown={handleKeyDown}
			onCancel={event => {
				event.preventDefault();
				onClose();
			}}
			onPointerDown={event => {
				pointerStartedOnBackdrop.current = event.target === event.currentTarget;
			}}
			onClick={event => {
				if (event.target === event.currentTarget && pointerStartedOnBackdrop.current) onClose();
				pointerStartedOnBackdrop.current = false;
			}}
		>
			{!media.length && closeButton}
			<div ref={contentRef} className="instagram-modal__content">
				<h2 ref={titleRef} id={titleId} className="instagram-modal__sr-only" tabIndex={-1}>
					{username ? `Допис ${username} в Instagram` : 'Допис Instagram'}
				</h2>
				{media.length ? (
					<div className="instagram-modal__layout">
						<PostMedia
							key={item.id || item.url}
							media={media}
							index={activeMediaIndex}
							caption={item.caption}
							onPrevious={() => setMediaIndex(index => Math.max(0, index - 1))}
							onNext={() => setMediaIndex(index => Math.min(media.length - 1, index + 1))}
						/>
						<div className="instagram-modal__details">
							<header className="instagram-modal__header">
								{permalink ? (
									<a
										className="instagram-modal__author"
										href={permalink}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Відкрити допис ${username || 'Instagram'} в Instagram`}
									>
										<InstagramIcon />
										<span>{username || 'Instagram'}</span>
									</a>
								) : (
									<span className="instagram-modal__author">
										<InstagramIcon />
										<span>{username || 'Instagram'}</span>
									</span>
								)}
								{closeButton}
							</header>
							{navigation}
							<div className="instagram-modal__description">
								{item.caption && (
									<p className="instagram-modal__caption">{item.caption}</p>
								)}
								{extraHashtags.length > 0 && (
									<p className="instagram-modal__hashtags">{extraHashtags.join(' ')}</p>
								)}
							</div>
							{date && (
								<footer className="instagram-modal__footer">
									<time dateTime={date.value}>{date.text}</time>
								</footer>
							)}
						</div>
					</div>
				) : (
					<div className="instagram-modal__embed-content">
						{navigation}
						<InstagramPostEmbed url={item.url} />
					</div>
				)}
			</div>
		</dialog>,
		document.body
	);
};

export default InstagramEmbed;
