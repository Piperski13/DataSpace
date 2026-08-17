const express = require("express");
const path = require("node:path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");

const usersRouter = require("./routes/user.routes.js");
const authRouter = require("./routes/auth.routes.js");
const chatRouter = require("./routes/chat.routes.js");

const workspaceRouter = require("./routes/workspace.routes.js");
const collectionRouter = require("./routes/collection.routes.js");
const recordRouter = require("./routes/record.routes.js");

const isAuthenticated = require("./middleware/auth/isAuthenticated.js");
const errorHandler = require("./middleware/errors/errorHandler.js");

require("./config/passportConfig");
require("dotenv").config("./.env");

// Initialize client.
let redisClient = createClient();
redisClient.connect().catch(console.error);

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

const app = express();

// Built-in body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    store: redisStore,
    secret: process.env.AUTH_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files from disk
app.use(process.env.UPLOADS_URL, express.static(process.env.UPLOADS_PATH));

app.use((req, res, next) => {
  res.locals.uploadsUrl = process.env.UPLOADS_URL;
  next();
});

// EJS setup
app.set("views", path.join(__dirname, "views/pages"));
app.set("view engine", "ejs");

// Routes
app.use("/auth", authRouter);

app.use("/workspaces", isAuthenticated, workspaceRouter);

app.use("/workspaces/:workspaceId", isAuthenticated, collectionRouter);

app.use(
  "/workspaces/:workspaceId/collections/:collectionId",
  isAuthenticated,
  recordRouter,
);

app.use("/users", isAuthenticated, usersRouter);

app.use("/chat", isAuthenticated, chatRouter);

app.use(errorHandler);

module.exports = app;
