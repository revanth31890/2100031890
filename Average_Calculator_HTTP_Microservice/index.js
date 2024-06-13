const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const accessToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4MjYxNTE5LCJpYXQiOjE3MTgyNjEyMTksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjkxYTk5ZTYyLTU3ODYtNDU5YS1iZWJjLWY4NDdmNTc4YjFiNSIsInN1YiI6IjIxMDAwMzE4OTBjc2VoQGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6IkFmZm9yZG1lZCIsImNsaWVudElEIjoiOTFhOTllNjItNTc4Ni00NTlhLWJlYmMtZjg0N2Y1NzhiMWI1IiwiY2xpZW50U2VjcmV0IjoicmF3T1RnYkNjRE55UExmeiIsIm93bmVyTmFtZSI6IlJldmFudGgiLCJvd25lckVtYWlsIjoiMjEwMDAzMTg5MGNzZWhAZ21haWwuY29tIiwicm9sbE5vIjoiMjEwMDAzMTg5MCJ9.9P140-IslW9xO2crQ06TiOFW1M3g3OXn9vNj88F1i20";

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

app.get('/numbers/:numberid', async (req, res) => {
    const shortIdentifier = req.params.numberid;
    const fullIdentifier = identifierMap[shortIdentifier];

    if (!fullIdentifier) {
        return res.status(400).json({ error: "Invalid identifier" });
    }

    try {
        const response = await axios.get(`http://20.244.56.144/test/${fullIdentifier}`, {
            headers: {
                Authorization: accessToken
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
