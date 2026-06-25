import express from "express";
import config from "./configuration/config.js";
import mongoose from "mongoose";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/userAccount.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import authentication from "./middlewares/authentication.middleware.js";
import {createAdmin} from "./configuration/initAdmin.js";
import {hasRole} from "./middlewares/authorization.middleware.js";
import {ADMIN} from "./configuration/constants.js";

const app = express();

const authorizationRouter = express.Router();

app.use(express.json());
app.use(authentication);

authorizationRouter.patch('/account/user/:login/role/:role', hasRole(ADMIN))
authorizationRouter.delete('/account/user/:login/role/:role', hasRole(ADMIN))

app.use(authorizationRouter);
app.use('/forum', postRoutes);
app.use('/account', userRoutes);

app.use(errorHandler);

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri, config.mongodb.db);
        await createAdmin();
        console.log('Connected to MongoDB');
    } catch (e) {
        console.log('Failed connecting to MongoDB: ', e);
    }
}

async function startServer() {
    await connectDB();
    app.listen(config.port, () => console.log(`Server is running on port ${config.port}. Press Ctrl-C to quit.`));
}

startServer();