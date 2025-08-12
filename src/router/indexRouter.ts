import express from 'express';
import authenticationRouter from "./authenticationRouter";
import usersRouter from "./usersRouter";
import supplierRouter from "./supplierRouter";
import clientRouter from "./clientRouter";

const router = express.Router();

export default  (): express.Router => {
  authenticationRouter(router);
  usersRouter(router);
  clientRouter(router);
  supplierRouter(router);

  return router;
}