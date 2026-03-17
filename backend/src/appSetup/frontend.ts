import fs from 'fs';
import path from 'path';
import express, { Express } from 'express';
import { routePaths } from './config';

// Checks whether a compiled frontend bundle exists and is safe to serve.
export function hasFrontendBuild(frontendDistDirectory: string): boolean {
  if (!frontendDistDirectory) {
    return false;
  }

  const indexFilePath = path.join(frontendDistDirectory, 'index.html');
  return fs.existsSync(indexFilePath);
}

// Serves the SPA bundle and falls back to index.html for client-side routes.
export function registerFrontendRoutes(
  expressApplication: Express,
  frontendDistDirectory: string
): void {
  expressApplication.use(express.static(frontendDistDirectory));

  expressApplication.get('*', (request, response, next) => {
    const requestPath = request.path;
    const isApiRoute = requestPath.startsWith(routePaths.apiBase);
    const isDocsRoute = requestPath.startsWith(routePaths.apiDocs);
    const isHealthRoute = requestPath === routePaths.healthCheck;
    const isUploadsRoute = requestPath.startsWith(routePaths.uploadsPublicPath);

    if (isApiRoute || isDocsRoute || isHealthRoute || isUploadsRoute) {
      next();
      return;
    }

    response.sendFile(path.join(frontendDistDirectory, 'index.html'));
  });
}

// Adds the catch-all JSON 404 response after all known routes are registered.
export function registerNotFoundRoute(expressApplication: Express): void {
  expressApplication.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });
}
