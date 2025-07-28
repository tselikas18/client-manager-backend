import express from 'express';
import authenticationRouter from "./authenticationRouter";

const router = express.Router();

export default  (): express.Router => {
  authenticationRouter(router)

  return router;
}