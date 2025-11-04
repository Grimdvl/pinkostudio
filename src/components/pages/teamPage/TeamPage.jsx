import './teamPage.scss'; 
import { useState, useEffect } from 'react'
import { getAcf } from "../../services/service";
import TeamMember from './teamMember/TeamMember';

const TeamPage = () => {
	const [acf, setAcf] = useState([]);

	useEffect(() => {
		getAcf(2)
			.then(setAcf)
			.catch(console.error);
	}, []);

	const { 
		team_title,
	} = acf;

	return (
		<section className="team" id="team">
			<h2 className='team__title'>{team_title}</h2>
			<TeamMember/>
		</section>
	);
}

export default TeamPage;