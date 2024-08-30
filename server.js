import express from 'express';
import routes from './routes/index';

const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Using the routes defined in routes/index.js
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
