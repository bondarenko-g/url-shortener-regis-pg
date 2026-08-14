import express from 'express';
import { createUrl, redirectToUrl } from '../controllers/urlController.js';

const Router = express.Router();

Router.post('/urls', createUrl);
Router.get('/:code', redirectToUrl);

export default Router;