require("./config/env")

const express = require("express")

const checkAuth = require("./middleware/auth")

const app = express()

const session = require("express-session")

const { MongoStore } = require("connect-mongo");

const connectDB = require("./config/db")

const authRoutes = require("./routes/auth-routes")

const userRoutes = require("./routes/user-routes")

const profileRoutes = require("./routes/profile-route")

const entityRoutes = require("./routes/entity-route")

const PORT = process.env.PORT

app.use(express.json())


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        name: "connect.sid",

        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            dbName: process.env.DB_NAME,
            ttl: 60 * 60
        }),

        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use("/api/auth", authRoutes)

app.use("/api/user", checkAuth, userRoutes)

app.use("/api/user/profile", checkAuth, profileRoutes)

app.use("/api/user/entity", checkAuth, entityRoutes)


app.get("/", (req, res) => {
    res.send("Authentication Server is Running")
})


async function startServer() {
    try {
        const db = await connectDB()

        console.log("MongoDB Connected Successfully")

        app.locals.db = db

        app.listen(PORT, () => {
            console.log(`Server Started at http://localhost:${PORT}/`)
        })


    } catch (error) {

        console.error(error)

        console.log("Failed to Start Server")

        process.exit(1)

    }

}

startServer()