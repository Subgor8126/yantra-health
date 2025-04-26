import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        region: import.meta.env.VITE_COGNITO_REGION,
        loginWith: { // Optional
          oauth: {
            domain: import.meta.env.VITE_COGNITO_DOMAIN,
            scopes: ['openid', 'email', 'phone'],
            redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_URI],
            redirectSignOut: [import.meta.env.VITE_COGNITO_REDIRECT_URI],
            responseType: 'code'
          }
        }
      }
    }
  });
