// --- ENV ---
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// --- Imports ---
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

// --- Utils ---
const ExpressError = require("./utils/ExpressError.js");

// --- Routers ---
const authRouter = require("./routes/authRouter.js");
const profileRouter = require("./routes/profileRouter.js");
const reportsRouter = require("./routes/reportsRouter.js");
const eventsRouter = require("./routes/eventsRouter.js");
const committeeRouter = require("./routes/committeeRouter.js");
const shopRouter = require("./routes/shopRouter.js");
const ospRouter = require("./routes/ospRouter.js");
const trainingRouter = require("./routes/trainingRouter.js");
const recycleRouter = require("./routes/recycleRouter.js");
const officialRouter = require("./routes/officialRouter.js");
const wasteSubmissionRouter = require("./routes/wasteSubmissionRouter.js");

// --- Models ---
const User = require("./schemas/User.js");

// --- App ---
const app = express();

// --- ENV VARIABLES ---
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "your_session_secret_here";
const MONGO_URL = process.env.MONGO_URL;

// Safety check 
if (!MONGO_URL) {
  throw new Error("MONGO_URL is missing in environment variables");
}

// --- MongoDB Connection ---
mongoose
  .connect(MONGO_URL)
  .then(() => console.log(" MongoDB connected successfully"))
  .catch((err) => console.log(" MongoDB connection error:", err));

// --- Session Store ---
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log(" MONGO SESSION STORE ERROR", err);
});

// --- Session Config ---
const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// --- Middleware ---
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PROD_LINK_REACT
        : process.env.DEV_LINK_REACT,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// --- Passport Setup ---
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Routes ---
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/reports", reportsRouter);
app.use("/events", eventsRouter);
app.use("/committees", committeeRouter);
app.use("/shop", shopRouter);
app.use("/osp", ospRouter);
app.use("/training", trainingRouter);
app.use("/recycle", recycleRouter);
app.use("/official", officialRouter);
app.use("/waste-submission", wasteSubmissionRouter);

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("Backend is running ");
});

// --- 404 Handler ---
app.use((req, res, next) => {
  next(new ExpressError(404, "API not found!"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
