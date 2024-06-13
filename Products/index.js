const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const acceptedCompanies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const acceptedCategories = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

let accessToken = '';

function validateCompanyAndCategory(company, category) {
    return acceptedCompanies.includes(company) && acceptedCategories.includes(category);
}

async function fetchAuthToken(companyName, clientID, clientSecret, ownerName, ownerEmail, rollNo) {
    const response = await axios.post('http://20.244.56.144/test/auth', {
        companyName,
        clientID,
        clientSecret,
        ownerName,
        ownerEmail,
        rollNo
    });
    return response.data.access_token;
}

async function fetchAccessTokenOnStartup() {
    try {
        accessToken = await fetchAuthToken("Affordmed", "91a99e62-5786-459a-bebc-f847f578b1b5", "rawOTgbCcDNyPLfz", "Revanth", "2100031890cseh@gmail.com", "2100031890");
        console.log(accessToken)
    } catch (error) {
        console.error('Error fetching access token on startup:', error);
    }
}

fetchAccessTokenOnStartup();

async function fetchProducts(company, category, top, minPrice, maxPrice) {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products`, {
        params: {
            top,
            minPrice,
            maxPrice
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
}

async function fetchProductDetails(company, category, productid) {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products/${productid}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
}

app.get('/categories/:categoryname/products', async (req, res) => {
    try {
        const { categoryname } = req.params;
        const { top, minPrice, maxPrice, sortBy, sortOrder, page = 1, company } = req.query;

        if (!validateCompanyAndCategory(company, categoryname)) {
            return res.status(400).json({ error: 'Invalid company or category' });
        }

        const products = await fetchProducts(company, categoryname, top, minPrice, maxPrice);

        const startIndex = (page - 1) * top;
        const endIndex = page * top;
        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    try {
        const { categoryname, productid } = req.params;
        const { company } = req.query;

        if (!validateCompanyAndCategory(company, categoryname)) {
            return res.status(400).json({ error: 'Invalid company or category' });
        }

        const productDetails = await fetchProductDetails(company, categoryname, productid);

        res.json(productDetails);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
