export const environment = {
  production: false,
  // API Gateway URL - all requests go through the gateway
  apiUrl: 'http://localhost:8083/api',
  // Gateway will route /api/policies/** to policy-service (8081)
  // Gateway will route /api/claims/** to claims-service (8082)
  // Gateway will route /api/admin/** to respective services with ADMIN role check
  
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'Trustiify',
    clientId: 'Trustify-frontend', // This is the exact client ID as registered in Keycloak
    redirectUri: window.location.origin,
  }
};