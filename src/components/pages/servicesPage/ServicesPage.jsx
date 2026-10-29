import "./servicesPage.scss";
import ServicesItem from './servicesItem/ServicesItem';

const ServicesPage = () => {
	// Усі картки послуг завантажуються всередині ServicesItem.
	return (
		<section id="services" className="services">
			<ServicesItem />
		</section>
	);
};

export default ServicesPage;
