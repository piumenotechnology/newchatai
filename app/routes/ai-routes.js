import express from 'express';
import deal from '../controller/deal-controller.js';
import outstanding from '../controller/outstanding-controller.js';

const router = express.Router();

router.post('/askDeal', deal.answerDeal);
router.post('/askOutstanding', outstanding.answerOutstanding)


export default router;

