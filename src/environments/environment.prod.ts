export const environment = {
  production: true,
  apiUrl: 'http://localhost:8081/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'Trustiify',
    clientId: 'Trustify-frontend', // This is the exact client ID as registered in Keycloak
    redirectUri: window.location.origin,
  }
};