import 'dotenv/config';
import express, { json }  from 'express';
import reqLog from './app/middleware/middleware.js'
import router from '.app/routes/ai-routes.js';

const PORT = process.env.PORT || 8000;
const app = express();

//middleware
app.use (reqLog);
app.use (json());

app.use('/api/v1', router);

app.listen (PORT, () => {
    console.log(`server running on port ${PORT}`)
})