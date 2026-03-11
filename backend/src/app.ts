/**
 * Composes the Express application from focused bootstrap modules.
 */
import express from 'express';
import { errorHandler } from './middleware/error.middleware';
import { registerApiFeatureRoutes } from './bootstrap/apiRoutes';
import { buildApplicationSetupConfig } from './bootstrap/config';
import {
  registerApiDocumentation,
  registerHealthCheckRoute,
  registerRootRoute,
} from './bootstrap/documentation';
import {
  hasFrontendBuild,
  registerFrontendRoutes,
  registerNotFoundRoute,
} from './bootstrap/frontend';
import { registerCoreMiddleware, registerUploadStaticRoute } from './bootstrap/middleware';

function createExpressApplication() {
  const setupConfig = buildApplicationSetupConfig();
  const expressApplication = express();

  expressApplication.set('trust proxy', 1);

  registerCoreMiddleware(
    expressApplication,
    setupConfig.allowedCorsOrigin,
    setupConfig.runningEnvironment
  );
  registerUploadStaticRoute(
    expressApplication,
    setupConfig.routePaths.uploadsPublicPath,
    setupConfig.directoryPaths.uploadsDirectory
  );
  registerApiDocumentation(expressApplication, setupConfig.routePaths.apiDocs);
  registerHealthCheckRoute(expressApplication, setupConfig.routePaths.healthCheck);
  registerApiFeatureRoutes(expressApplication, setupConfig.routePaths.apiBase);

  if (hasFrontendBuild(setupConfig.directoryPaths.frontendDistDirectory)) {
    registerFrontendRoutes(expressApplication, setupConfig.directoryPaths.frontendDistDirectory);
  } else {
    registerRootRoute(expressApplication);
  }

  registerNotFoundRoute(expressApplication);
  expressApplication.use(errorHandler);

  return expressApplication;
}

const app = createExpressApplication();

export default app;
