import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';

// Replace with your own DB logic
const userDB: any = {};
const credentialDB: any = {};

export function getRegistrationOptions(user: any) {
    console.log('Generating registration options for user:', user);
    return generateRegistrationOptions({
        rpName: 'Croissant',
        rpID: 'localhost',
        userID: user.id, // doit être un Buffer/Uint8Array
        userName: user.username,
        attestationType: 'none',
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
    });
}

export async function verifyRegistration(body: any, expectedChallenge: string, user: any) {
    return verifyRegistrationResponse({
        response: body.credential,
        expectedChallenge,
        expectedOrigin: 'http://localhost:8580', // change to your domain in prod
        expectedRPID: 'localhost',
    });
}

export function getAuthenticationOptions(user: any, credentials: any[]) {
    return generateAuthenticationOptions({
        rpID: 'localhost',
        userVerification: 'preferred',
        allowCredentials: credentials.map((c) => ({
            id: c.credentialID,
            type: 'public-key',
            transports: c.transports,
        })),
    });
}

export async function verifyAuthentication(body: any, expectedChallenge: string, credentials: any[]) {
    const authenticator = credentials.find((c) => c.credentialID === body.credential.rawId);
    if (!authenticator) {
        throw new Error('Authenticator not found');
    }
    return verifyAuthenticationResponse({
        response: body.credential,
        expectedChallenge,
        expectedOrigin: 'http://localhost:8580',
        expectedRPID: 'localhost',
        credential: {
            id: authenticator.credentialID,
            publicKey: authenticator.credentialPublicKey,
            counter: authenticator.counter,
            transports: authenticator.transports,
        },
    });
}

// Add DB logic for storing/retrieving credentials as needed
