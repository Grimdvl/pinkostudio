import "./promoPage.scss";
import { useState, useEffect } from 'react';
import Logo from '../../logo/Logo.jsx';
import Header from "../../header/Header.jsx";
import Socials from "../../socials/Socials.jsx";
import { getAcf } from '../../services/service.js';

const PromoPage = () => {
	const [showNav, setShowNav] = useState(false);
	const [acf, setAcf] = useState({});

	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const { 
		promo_title,
		promo_subtitle,
		promo_button_1,
		promo_button_2,
		promo_photo,
	} = acf;

    return (
        <section id="promo" className="promo">
			<Header
				showNav={showNav}
				setShowNav={setShowNav}
			/>
			<div className="promo__descr">
				<Logo/>
				<h1 className="promo__descr-title">{promo_title}</h1>
				<h2 className="promo__descr-subtitle">{promo_subtitle}</h2>
				<div className="promo__descr-buttons">
					<button className="promo-btn button-booking">{promo_button_1}</button>
					<button className="promo-btn button-gift">{promo_button_2}</button>
				</div>
				<Socials/>
			</div>
			<div className="promo__photo">
				<Logo/>
				<img className="promo__photo-img" src={promo_photo} alt="promo-photo" />
			</div>
        </section>
    );
};

export default PromoPage;