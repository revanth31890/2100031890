const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

let accessToken = ""; 

const windowSize = 10;
let windowNumbers = [];

const identifierMap = {
    'p': 'primes',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand'
};

function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length || 0;
}

app.use(express.json());

// Function to fetch access token from third-party server
async function fetchAccessToken() {
    const apiCredentials = {
            "companyName": "Affordmed",
            "clientID": "91a99e62-5786-459a-bebc-f847f578b1b5",
            "clientSecret": "rawOTgbCcDNyPLfz",
            "ownerName": "Revanth",
            "ownerEmail": "2100031890cseh@gmail.com",
            "rollNo": "2100031890"
    };

    try {
        const response = await axios.post('http://20.244.56.144/test/auth', apiCredentials);
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.message);
        throw new Error("Failed to fetch access token");
    }
}

// Function to initialize server and fetch access token
async function initializeServer() {
    try {
        // Fetch access token
        accessToken = await fetchAccessToken();
        console.log("Access token fetched successfully:");
    } catch (error) {
        console.error("Error initializing server:", error.message);
        process.exit(1); // Exit the process if unable to fetch access token
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Call the function to initialize server and fetch access token
initializeServer();

app.get('/numbers/:numberid', async (req, res) => {
    const shortIdentifier = req.params.numberid;
    const fullIdentifier = identifierMap[shortIdentifier];

    if (!fullIdentifier) {
        return res.status(400).json({ error: "Invalid identifier" });
    }

    try {
        const response = await axios.get(`http://20.244.56.144/test/${fullIdentifier}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const numbers = response.data.numbers || [];

        const uniqueNumbers = [...new Set(numbers)];

        if (windowNumbers.length >= windowSize) {
            windowNumbers.shift(); // Remove oldest number
        }
        windowNumbers = [...windowNumbers, ...uniqueNumbers];

        const average = calculateAverage(windowNumbers);

        const responseData = {
            numbers: uniqueNumbers,
            windowPrevState: [...windowNumbers.slice(0, -uniqueNumbers.length)],
            windowCurrState: [...windowNumbers],
            avg: average.toFixed(2)
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
