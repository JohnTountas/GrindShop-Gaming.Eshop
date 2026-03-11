import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

function createCorsOptions(allowedCorsOrigin: string): CorsOptions {
  return {
    origin: allowedCorsOrigin,
    credentials: true,
  };
}

// Applies the shared middleware stack used by both local and deployed environments.
export function registerCoreMiddleware(
  expressApplication: Express,
  allowedCorsOrigin: string,
  runningEnvironment: string
): void {
  expressApplication.use(helmet());
  expressApplication.use(cors(createCorsOptions(allowedCorsOrigin)));
  expressApplication.use(express.json());
  expressApplication.use(express.urlencoded({ extended: true }));
  expressApplication.use(cookieParser());

  if (runningEnvironment === 'development') {
    expressApplication.use(morgan('dev'));
  }
}

// Exposes uploaded assets through the public uploads route.
export function registerUploadStaticRoute(
  expressApplication: Express,
  uploadsPublicPath: string,
  uploadsDirectoryPath: string
): void {
  expressApplication.use(uploadsPublicPath, express.static(uploadsDirectoryPath));
}
