// import admin, { ServiceAccount } from 'firebase-admin'
// import dotenv from 'dotenv'
// dotenv.config()

// const { 
//     PRODUCTION, 
//     TYPE, 
//     AUTH_URI, 
//     TOKEN_URI, 
//     AUTH_CERT_URL, 
//     UNIVERSE_DOMAIN,

//     PROD_PROJECT_ID,
//     PROD_PRIVATE_KEY_ID,
//     PROD_PRIVATE_KEY,
//     PROD_CLIENT_EMAIL,
//     PROD_CLIENT_ID,
//     PROD_CLIENT_CERT_URL
// } = process.env

// if (!TYPE || !AUTH_URI || !TOKEN_URI || !AUTH_CERT_URL || !UNIVERSE_DOMAIN) {
//     throw new Error('Missing essential environment variables.')
// }

// const PROD = {
//     PROJECT_ID: PROD_PROJECT_ID,
//     PRIVATE_KEY_ID: PROD_PRIVATE_KEY_ID,
//     PRIVATE_KEY: PROD_PRIVATE_KEY,
//     CLIENT_EMAIL: PROD_CLIENT_EMAIL,
//     CLIENT_ID: PROD_CLIENT_ID,
//     CLIENT_CERT_URL: PROD_CLIENT_CERT_URL
// }

// if (
//     !PROD.PROJECT_ID 
//     || !PROD.PRIVATE_KEY_ID 
//     || !PROD.PRIVATE_KEY 
//     || !PROD.CLIENT_EMAIL 
//     || !PROD.CLIENT_ID 
//     || !PROD.CLIENT_CERT_URL
// ) {
//     throw new Error('Missing production environment variables.')
// }


// const SERVICE_ACCOUNT = PRODUCTION === "true" ? PROD : DEV

// admin.initializeApp({
//     credential: admin.credential.cert({
//         type: TYPE,
//         project_id: SERVICE_ACCOUNT.PROJECT_ID,
//         private_key_id: SERVICE_ACCOUNT.PRIVATE_KEY_ID,
//         private_key: SERVICE_ACCOUNT.PRIVATE_KEY,
//         client_email: SERVICE_ACCOUNT.CLIENT_EMAIL,
//         client_id: SERVICE_ACCOUNT.CLIENT_ID,
//         auth_uri: AUTH_URI,
//         token_uri: TOKEN_URI,
//         auth_provider_x509_cert_url: AUTH_CERT_URL,
//         client_x509_cert_url: SERVICE_ACCOUNT.CLIENT_CERT_URL,
//         universe_domain: UNIVERSE_DOMAIN
//     } as ServiceAccount),
// })

// // Exports the Firestore database
// const db = admin.firestore()
// export default db
