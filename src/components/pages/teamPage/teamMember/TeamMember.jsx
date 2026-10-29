import "./teamMember.scss";
import photo from '../../../../assets/img/photo.png';
import { useState, useEffect } from 'react';
import { getCat } from '../../../services/service';

const TeamMember = () => {
	const [items, setItems] = useState([]);

	// Дані кожного майстра — це окремий запис категорії team у WordPress.
	useEffect(() => {
		getCat('team')
			.then(posts => {
				const mapped = (Array.isArray(posts) ? posts : []).map(post => ({
					id: post.id,
					alt: post.slug,
					img: post.acf?.team_img,
					name: post.acf?.team_name,
					work: post.acf?.team_work,
					link: post.acf?.team_link,
				}));

				setItems(mapped);
			})
			.catch(console.error);
	}, []);

	return (
		<div className="team__members">
			{items.map(item => (
				<div className="team__members-wrapper" key={item.id}>
					<div className="member__img">
						<img
							src={item.img || photo}
							alt={item.alt}
							className="member__img-photo"
							loading="lazy"
							decoding="async"
						/>
						{item.link && (
							<a
								className="member__img-link"
								href={item.link}
								aria-label={item.name || item.alt}
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg className="member__img-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
									<path d="M14 8V3l8 8-8 8v-5C8 14 4.5 17 2 21 2 13 6 8 14 8Z" />
								</svg>
							</a>
						)}
					</div>
					<h3 className="member-name">{item.name}</h3>
					<p className="member-work">{item.work}</p>
				</div>
			))}
		</div>
	);
};

export default TeamMember;
