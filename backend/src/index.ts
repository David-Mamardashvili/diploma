import express from 'express';
import cors from 'cors';
import scanSituationRoutes from './routes/scanSituationRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(scanSituationRoutes);

app.listen(3001, () => {
  console.log('Backend запущен: http://localhost:3001');
});