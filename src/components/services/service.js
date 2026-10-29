const wordpressRestRoot = 'https://api.pinkostudio.artemsokur.com/wp-json';
const api = `${wordpressRestRoot}/wp/v2`;

const postData = async (url, data) => {
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json'
		},
		body: data
	});

	return await res.json();
};

const getResources = async (endpoint) => {
	const res = await fetch(`${api}/${endpoint}`);

	if (!res.ok) {
		throw new Error(`Could not fetch ${endpoint}, status: ${res.status}`);
	}

	const data = await res.json();

	// Списки повертаємо повністю, зі сторінки беремо лише поля ACF.
	if (Array.isArray(data)) return data;
	return data?.acf ?? {};
};

const getAcf = async (pageId) => {
	return await getResources(`pages/${pageId}?_fields=acf`);
};

const getCat = async (slug) => {
	// Спочатку знаходимо категорію, потім отримуємо її записи.
	const cats = await getResources(`categories?slug=${slug}&_fields=id,slug`);
	const catId = cats[0].id;

	return await getResources(
		`posts?categories=${catId}&per_page=50&_fields=id,slug,acf`
	);
};

export {
	wordpressRestRoot,
	postData,
	getResources,
	getAcf,
	getCat
};
