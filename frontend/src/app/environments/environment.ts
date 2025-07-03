declare const process: any;

export const environment={
    apiUrl:process.env['NG_APP_API_URL'] || `http://localhost:3000/api/`,
    baseUrl:process.env['NG_APP_BASE_URL'] ||'http://localhost:3000',
    production:  process.env['NG_APP_PRODUCTION'] === 'true' || false,
    stripePublishKey:process.env['NG_APP_STRIPE_KEY'] || '',
    zegoAppId: parseInt(process.env['NG_APP_ZEGO_APP_ID'] ||''),
    firebase: {
        apiKey: process.env['NG_APP_FIREBASE_API_KEY'] ||"",
        authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'] ||  "",
        projectId:process.env['NG_APP_FIREBASE_PROJECT_ID'] || "",
        storageBucket:  process.env['NG_APP_FIREBASE_STORAGE_BUCKET'] || "",
        messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || "",
        appId:process.env['NG_APP_FIREBASE_APP_ID'] || ""
    }
}

