// middleware.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { API_KEY, AUTH_STRATEGY, SECRET_JWT_KEY } from "./config";

// Middleware for checking the auth strategy and JWT token
export const checkAuthStrategy = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== API_KEY) {
    res.status(403).send("Forbidden");
    return;
  }

  // const authStrategy = req.headers['x-auth-strategy'];

  // Only check for the JWT token if the authentication strategy is 'local'
  if (AUTH_STRATEGY === "password") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      res.status(401).send("Unauthorized");
      return;
    }

    jwt.verify(token, SECRET_JWT_KEY, (err) => {
      if (err) {
        res.status(403).send("Forbidden");
        return;
      }

      next();
    });
  } else {
    next();
    return;
  }
};
