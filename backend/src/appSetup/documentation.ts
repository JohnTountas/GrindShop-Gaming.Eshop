import path from 'path';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

function buildSwaggerDocumentationOptions() {
  const routeDefinitionGlobs = [
    path.join(process.cwd(), 'src/features/**/*.routes.ts'),
    path.join(__dirname, '../features/**/*.routes.js'),
  ];

  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'grindspot E-Shop API',
        version: '1.0.0',
        description: 'Modern e-commerce API built with Express and TypeScript',
        contact: {
          name: 'API Support',
        },
      },
      servers: [
        {
          url: '/',
          description: 'Current deployment origin',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: routeDefinitionGlobs,
  };
}

// Registers the generated Swagger UI and spec for interactive API browsing.
export function registerApiDocumentation(expressApplication: Express, docsRoutePath: string): void {
  const swaggerDocumentationOptions = buildSwaggerDocumentationOptions();
  const swaggerSpecification = swaggerJsDoc(swaggerDocumentationOptions);

  expressApplication.use(docsRoutePath, swaggerUi.serve, swaggerUi.setup(swaggerSpecification));
}

// Adds the health endpoint used by platforms and operators to check readiness.
export function registerHealthCheckRoute(expressApplication: Express, healthCheckPath: string): void {
  expressApplication.get(healthCheckPath, (_request, response) => {
    response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
}

// Exposes a lightweight root endpoint when the frontend build is not being served.
export function registerRootRoute(expressApplication: Express): void {
  expressApplication.get('/', (_request, response) => {
    response.json({
      name: 'grindspot API',
      status: 'online',
      endpoints: {
        health: '/health',
        docs: '/docs',
        auth: '/api/auth',
        products: '/api/products',
        categories: '/api/categories',
      },
    });
  });
}

