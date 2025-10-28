const API = 'https://api.pinkostudio.artemsokur.com/wp-json/wp/v2';

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
    const res = await fetch(`${API}/${endpoint}`);

    if (!res.ok) {
        throw new Error(`Could not fetch ${endpoint}, status: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data?.acf ?? {};
};

const getAcf = async (pageId) => {
    return await getResources(`pages/${pageId}?_fields=acf`);
};

const getCat = async (slug) => {
    const cats = await getResources(`categories?slug=${slug}&_fields=id,slug`);
    const catId = cats[0].id;
    console.log('Category ID:', catId); //прибрати після тестування!!!

    return await getResources(
        `posts?categories=${catId}&per_page=50&_fields=id,slug,acf`
    );
};

export {
    postData,
    getResources,
    getAcf,
    getCat
};
