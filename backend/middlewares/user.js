import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

export const applyMiddleware = (app) => {
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
};