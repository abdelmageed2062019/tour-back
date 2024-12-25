const axios = require("axios");

// Function to get USD to EGP conversion rate
async function getExchangeRate() {
  try {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const rate = response.data.rates.EGP;
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw new Error("Could not fetch exchange rate");
  }
}
module.exports = { getExchangeRate };
