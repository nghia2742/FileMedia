require("dotenv").config();
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const rateLimit = require('express-rate-limit');
const route = require("./routes");
const db = require("./config/db");
const session = require("express-session");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");

const PORT = 4000;

// Define engine
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: false,
  })
);
app.set("view engine", ".hbs");

app.use(express.static('users'))

// Define COOKIES
app.use(cookieParser(process.env.SESSION_SECRET));

// Define SESSION
app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Define url encode
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Prevent DDoS
// Limit the number of access
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // a minute
  max: 100, // the maximum number of access
});

// Use middleware limit rate for all app
// app.use(limiter);

// Connect to DB
db.connect();

// Define FLASH
app.use(flash());


// ROUTES
route(app);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
