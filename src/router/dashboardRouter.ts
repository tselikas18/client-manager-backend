import express from 'express'
import {isAuthenticated} from "../middlewares";
import {getDashboardStats} from "../controllers/dashboardController";

export default (router: express.Router) => {
  router.get('/dashboard', isAuthenticated, getDashboardStats);
}