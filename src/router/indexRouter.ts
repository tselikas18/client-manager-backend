import express from 'express';
import authenticationRouter from "./authenticationRouter";
import usersRouter from "./usersRouter";

const router = express.Router();

export default  (): express.Router => {
  authenticationRouter(router);
  usersRouter(router);

  return router;
}