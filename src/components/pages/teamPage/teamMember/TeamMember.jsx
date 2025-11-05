import "./teamMember.scss";
import photo from '../../../../assets/img/photo.png';
import { useState, useEffect } from 'react'
import { getCat } from "../../../services/service";

const TeamMember = () => {
	const [items, setItems] = useState([])

	useEffect(() => {
		getCat('team')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(p => ({
					id: p.id,
					alt: p.slug,
					img: p.acf?.team_img,
					name: p.acf?.team_name,
					work: p.acf?.team_work,
					link: p.acf?.team_link,
				}));
				setItems(mapped);})
			.catch(console.error);
	}, []);

	return (
		<div className="team__members">
			{items.map(i => (
			<div className="team__members-wrapper">
				<div className="member__img">
					<img
						src={i.img || photo}
						alt={i.alt}
						className="member__img-photo"
					/>
					<a
						key={i.id}
						className="member__img-link"
						href={i.link}
						alt={i.alt}
						target="_blank"
						rel="noreferrer"
						>
						<i class='bx bx-link'></i> 
					</a>
				</div>
				<h3 className="member-name">{i.name}</h3>
				<p className="member-work">{i.work}</p>
			</div>
			))}
		</div>
	);
};

export default TeamMember;
