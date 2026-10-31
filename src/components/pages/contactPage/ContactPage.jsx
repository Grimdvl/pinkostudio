import "./contactPage.scss";
import { getAcf } from '../../services/service.js';
import { useState, useEffect } from 'react';

const ContactPage = () => {
	const [acf, setAcf] = useState({});

	// Контактні поля зберігаються на головній сторінці WordPress з ID 2.
	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const {
		contact_title,
		contact_worktime_title,
		contact_worktime,
		contact_address_title,
		contact_address,
		contact_phone_title,
		contact_phone,
	} = acf;

	return (
		<section id="contact">
			<h2 className="contact__title title">{contact_title}</h2>
			<div className="contact__info">
				<div className="contact__info-item">
					<h3 className="contact__info-item-title">{contact_worktime_title}:</h3>
					<p className="contact__info-item-descr">{contact_worktime}</p>
				</div>
				<div className="contact__info-item">
					<h3 className="contact__info-item-title">{contact_address_title}:</h3>
					<p className="contact__info-item-descr">{contact_address}</p>
				</div>
				<div className="contact__info-item">
					<h3 className="contact__info-item-title">{contact_phone_title}:</h3>
					<p className="contact__info-item-descr">{contact_phone}</p>
				</div>
			</div>
		</section>
	);
};
 
export default ContactPage;
