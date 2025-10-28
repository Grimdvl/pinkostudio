import "./logo.scss";
import { useState, useEffect } from 'react';
import { getAcf } from '../services/service.js';

const Logo = () => {
	const [acf, setAcf] = useState({});

	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const { 
		logo_title,
		logo_subtitle,
	} = acf;

    return (
        <div className="logo">
			<div className="logo__title">{logo_title}</div>
			<div className="logo__subtitle">{logo_subtitle}</div>
        </div>
    );
};

export default Logo;