import "./aboutPage.scss";
import { useState, useEffect } from 'react'
import { getAcf } from "../../services/service";
import AboutSlider from "./aboutSlider/AboutSlider";

const AboutPage = () => {
	const [acf, setAcf] = useState([]);

	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const { 
		about_title,
		about_descr,
	} = acf;

	return (
		<section id="about" className="about">
			<AboutSlider />
			<div className="about__text">
				<h2 className="about__text-title">{about_title}</h2>
				<p className="about__text-descr">{about_descr}</p>
			</div>
		</section>
	);
};

export default AboutPage;
