import './portfolioPage.scss';
import { useEffect, useState } from 'react';
import { getAcf } from "../../services/service";
import PortfolioSlider from './portfolioSlider/PortfolioSlider';

const PortfolioPage = () => {
	const [acf, setAcf] = useState([]);

	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const { 
		portfolio_title
	} = acf;

	return (
		<section className="portfolio section" id="portfolio">
			<h2 className="portfolio__title title">{portfolio_title}</h2>
			<PortfolioSlider/>
		</section>
	);
}

export default PortfolioPage;