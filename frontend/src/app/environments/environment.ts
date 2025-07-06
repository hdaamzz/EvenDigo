// declare const process: any;

// export const environment={
//     apiUrl:process.env['NG_APP_API_URL'] || `http://localhost:3000/api/`,
//     baseUrl:process.env['NG_APP_BASE_URL'] ||'http://localhost:3000',
//     production:  process.env['NG_APP_PRODUCTION'] === 'true' || false,
//     stripePublishKey:process.env['NG_APP_STRIPE_KEY'] || '',
//     zegoAppId: parseInt(process.env['NG_APP_ZEGO_APP_ID'] ||''),
//     firebase: {
//         apiKey: process.env['NG_APP_FIREBASE_API_KEY'] ||"",
//         authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'] ||  "",
//         projectId:process.env['NG_APP_FIREBASE_PROJECT_ID'] || "",
//         storageBucket:  process.env['NG_APP_FIREBASE_STORAGE_BUCKET'] || "",
//         messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || "",
//         appId:process.env['NG_APP_FIREBASE_APP_ID'] || ""
//     }
// }

export const environment={
    apiUrl:`http://localhost:3000/api/`,
    baseUrl:'http://localhost:3000',
    production: false,
    stripePublishKey:'pk_test_51R6SQALey1fPw3RmtMmRKk4u4xaIYP6c8uCl80J3I5KkVR5sDYSchEC6Am1Mviu64NEAjmytcchK5idY3Iczqszr00TRfqqrNc',
    zegoAppId:21216645,
    firebase: {
        apiKey: "AIzaSyDowOQt6DhNu9AZn1Go8FCHU4hD9dxRvC0",
        authDomain: "evendigo-cebf6.firebaseapp.com",
        projectId: "evendigo-cebf6",
        storageBucket: "evendigo-cebf6.firebasestorage.app",
        messagingSenderId: "336971427602",
        appId: "1:336971427602:web:2967cbaeba8467f8be4dcb"
    }
}