import express from 'express';
import { swaggerSpec } from './config/swagger';

const router: express.Router = express.Router();

// Serve swagger.json
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve Swagger UI index.html with custom config (simplified for serverless)
router.get('/api-docs', (req, res) => {
  // Ensure HTTPS in production to avoid mixed content issues
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const baseUrl = protocol + '://' + req.get('host');
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Evently API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-16x16.png" sizes="16x16" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html { 
      box-sizing: border-box; 
      overflow: -moz-scrollbars-vertical; 
      overflow-y: scroll; 
    }
    *, *:before, *:after { 
      box-sizing: inherit; 
    }
    body { 
      margin: 0; 
      background: #fafafa; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .swagger-ui .topbar { 
      display: none; 
    }
    .swagger-ui .info .title {
      color: #3b4151;
      font-size: 36px;
      margin: 0;
    }
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 2.5em;
      font-weight: 300;
    }
    .custom-header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>🎉 Evently API</h1>
    <p>Complete API documentation for the Evently event management platform</p>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      try {
        const ui = SwaggerUIBundle({
          url: '${baseUrl}/swagger.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          validatorUrl: null,
          docExpansion: "list",
          operationsSorter: "alpha",
          tagsSorter: "alpha",
          filter: true,
          tryItOutEnabled: true,
          requestInterceptor: function(request) {
            // Ensure proper headers for CORS
            request.headers['Content-Type'] = request.headers['Content-Type'] || 'application/json';
            // Add CORS headers if needed
            request.headers['Access-Control-Allow-Origin'] = '*';
            console.log('Request intercepted:', request);
            return request;
          },
          responseInterceptor: function(response) {
            // Handle responses here if needed
            return response;
          },
          onComplete: function() {
            console.log('Swagger UI loaded successfully');
          },
          onFailure: function(error) {
            console.error('Failed to load Swagger UI:', error);
          }
        });
        
        window.ui = ui;
      } catch (error) {
        console.error('Error initializing Swagger UI:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<div style="padding: 20px; text-align: center; color: #f93e3e;">'+
          '<h2>Error loading API documentation</h2>'+
          '<p>Please check the console for more details.</p>'+
          '</div>';
      }
    };
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(html);
});

export default router;
