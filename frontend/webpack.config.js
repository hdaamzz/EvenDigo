const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NG_APP_API_URL': JSON.stringify(process.env.NG_APP_API_URL || 'http://localhost:3000/api'),
        'NG_APP_BASE_URL': JSON.stringify(process.env.NG_APP_BASE_URL || 'http://localhost:4200'),
        'NG_APP_PRODUCTION': JSON.stringify(process.env.NODE_ENV === 'production'),
        'NG_APP_STRIPE_KEY': JSON.stringify(process.env.NG_APP_STRIPE_KEY || ''),
        'NG_APP_ZEGO_APP_ID': JSON.stringify(process.env.NG_APP_ZEGO_APP_ID || '0'),
        'NG_APP_FIREBASE_API_KEY': JSON.stringify(process.env.NG_APP_FIREBASE_API_KEY || ''),
        'NG_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.NG_APP_FIREBASE_AUTH_DOMAIN || ''),
        'NG_APP_FIREBASE_PROJECT_ID': JSON.stringify(process.env.NG_APP_FIREBASE_PROJECT_ID || ''),
        'NG_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.NG_APP_FIREBASE_STORAGE_BUCKET || ''),
        'NG_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.NG_APP_FIREBASE_MESSAGING_SENDER_ID || ''),
        'NG_APP_FIREBASE_APP_ID': JSON.stringify(process.env.NG_APP_FIREBASE_APP_ID || '')
      }
    })
  ]
};