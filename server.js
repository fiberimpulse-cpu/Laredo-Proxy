const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/search", async (req, res) => {
  const location = req.query.location || "Laredo, TX";
  const page = req.query.page || "1";
  try {
    const url = new URL("https://real-time-zillow-data.p.rapidapi.com/search");
    url.searchParams.set("location", location);
    url.searchParams.set("listingCategory", "House For Sale");
    url.searchParams.set("page", page);
    url.searchParams.set("sortSelection", "days");
    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "real-time-zillow-data.p.rapidapi.com",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Proxy running"));
