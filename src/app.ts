import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan';
import userRoutes from './routes/userRoutes'

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


const cors = require('cors');
//Do we need whitelist?
app.use(cors());

app.use("/api/user", userRoutes)
app.use("/", (req, res, next) => {
    console.log(`
    __________REQUEST INFO__________
    ${new Date().toISOString()}] ${req.ip} ${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`);

    console.dir(req.body)
})

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).end();
});

// Syncing our database
// db.sync().then(() => {
//     console.info("connected to the database!")
// });

app.listen(3001);