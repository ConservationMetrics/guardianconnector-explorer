import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PASSWORD, SECRET_JWT_KEY } from "./config";

// Endpoints for login
export const getLogin = (req: Request, res: Response) => {
  const secret_key = req.query.secret_key;

  if (secret_key !== SECRET_JWT_KEY) {
    res.status(403).send("Forbidden");
    return;
  }
  // If authentication is successful, generate and return a JWT
  const token = jwt.sign({}, SECRET_JWT_KEY);
  res.status(200).json({ token: token });
};

export const postLogin = (req: Request, res: Response) => {
  const providedPassword = req.body.password;

  if (providedPassword !== PASSWORD) {
    res.status(403).send("Forbidden");
    return;
  }
  // If authentication is successful, generate and return a JWT
  const token = jwt.sign({}, SECRET_JWT_KEY);
  res.status(200).json({ token: token });
};
