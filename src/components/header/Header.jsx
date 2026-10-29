import "./header.scss";
import { useState, useEffect, useRef } from 'react';
import { getAcf } from '../services/service.js';

const Header = ({ showNav, setShowNav }) => {
	const [acf, setAcf] = useState({});
	const headerRef = useRef(null);
	const burgerRef = useRef(null);

	// Беремо підписи меню з ACF головної сторінки WordPress.
	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const {
		nav_about,
		nav_team,
		nav_reviews,
		nav_portfolio,
		nav_booking,
	} = acf;

	// Відкрите мобільне меню блокує прокручування сторінки.
	// На широкому екрані закриваємо його та повертаємо звичайну прокрутку.
	useEffect(() => {
		const mobile = window.matchMedia('(max-width: 767px)');

		const syncMenu = () => {
			if (!mobile.matches) {
				setShowNav(false);

				if (document.activeElement === burgerRef.current) {
					headerRef.current?.querySelector('a[href]')?.focus({ preventScroll: true });
				}
			}

			document.documentElement.classList.toggle('no-scroll', mobile.matches && showNav);
		};

		syncMenu();
		mobile.addEventListener('change', syncMenu);

		return () => {
			mobile.removeEventListener('change', syncMenu);
			document.documentElement.classList.remove('no-scroll');
		};
	}, [showNav, setShowNav]);

	// Escape закриває меню, а Tab переміщує фокус тільки між його кнопками й посиланнями.
	useEffect(() => {
		if (!showNav) return;
		burgerRef.current?.focus({ preventScroll: true });

		const handleKeyDown = event => {
			if (event.key === 'Escape') {
				setShowNav(false);
				burgerRef.current?.focus();
			}

			if (event.key !== 'Tab') return;

			const controls = headerRef.current?.querySelectorAll('button, a[href]');
			if (!controls?.length) return;

			const first = controls[0];
			const last = controls[controls.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [showNav, setShowNav]);

	const toggleNav = () => {
		setShowNav(!showNav);
	};

	// Тексти приходять із WordPress; href вказує на відповідну секцію сайту.
	// Пункти з порожнім підписом не показуємо.
	const navigation = [
		{ id: 'about', label: nav_about, href: '#about' },
		{ id: 'team', label: nav_team, href: '#team' },
		{ id: 'reviews', label: nav_reviews },
		{ id: 'portfolio', label: nav_portfolio, href: '#portfolio' },
		{ id: 'booking', label: nav_booking },
	].filter(item => typeof item.label === 'string' && item.label.trim());

	return (
		<nav className="header" aria-label="Навігація сайтом" ref={headerRef}>
			<button
				type="button"
				className={`header__burger ${showNav ? 'active' : ''}`}
				ref={burgerRef}
				aria-expanded={showNav}
				aria-controls="site-navigation"
				aria-label={showNav ? 'Закрити меню' : 'Відкрити меню'}
				onClick={toggleNav}
			>
				<span className="header__burger-menu" aria-hidden="true" />
				<span className="header__burger-menu" aria-hidden="true" />
				<span className="header__burger-menu" aria-hidden="true" />
			</button>
			<ul id="site-navigation" className={`header__nav ${showNav ? 'active' : ''}`}>
				{navigation.map(item => (
					<li key={item.id} className="header__nav-item">
						{item.href ? (
							<a className="header__nav-link" href={item.href} onClick={() => setShowNav(false)}>
								{item.label}
							</a>
						) : (
							<span className="header__nav-link">{item.label}</span>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
};

export default Header;
