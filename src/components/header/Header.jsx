import "./header.scss";
import { useState, useEffect } from 'react';
import { getAcf } from '../services/service.js';

const Header = ({showNav, setShowNav}) => {
	const [acf, setAcf] = useState({});

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

	const toggleNav = () => {
		setShowNav(!showNav);
		document.documentElement.classList.toggle('no-scroll');
	};

    return (
        <nav className="header">
			<div className={`header__burger ${showNav ? 'active' : ''}`}
				onClick={toggleNav}
				>
				<span className="header__burger-menu"></span>
				<span className="header__burger-menu"></span>
				<span className="header__burger-menu"></span>
			</div>
			<ul className={`header__nav ${showNav ? 'active' : ''}`}>
				<li id="about" className="header__nav-item about">{nav_about}</li>
				<li id="team" className="header__nav-item team">{nav_team}</li>
				<li id="reviews" className="header__nav-item reviews">{nav_reviews}</li>
				<li id="portfolio" className="header__nav-item portfolio">{nav_portfolio}</li>
				<li id="booking" className="header__nav-item booking">{nav_booking}</li>
			</ul>
        </nav>
    );
};

export default Header;