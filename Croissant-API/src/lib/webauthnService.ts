/* eslint-disable @typescript-eslint/no-explicit-any */
import { Crypto } from '@peculiar/webcrypto';
if (!globalThis.crypto) {
    globalThis.crypto = new Crypto();
}
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';


export function getRegistrationOptions(user: any) {
    console.log('Generating registration options for user:', user);
    return generateRegistrationOptions({
        rpName: 'Croissant',
        rpID: 'croissant-api.fr',
        userID: user.id, // doit être un Buffer/Uint8Array
        userName: user.username,
        attestationType: 'none',
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
    });
}

export async function verifyRegistration(body: any, expectedChallenge: string) {
    return verifyRegistrationResponse({
        response: body.credential,
        expectedChallenge,
        expectedOrigin: 'https://croissant-api.fr', // change to your domain in prod
        expectedRPID: 'croissant-api.fr',
    });
}

export function getAuthenticationOptions(credentials: any[]) {
    return generateAuthenticationOptions({
        rpID: 'croissant-api.fr',
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
        expectedOrigin: 'https://croissant-api.fr',
        expectedRPID: 'croissant-api.fr',
        credential: {
            id: authenticator.credentialID,
            publicKey: authenticator.credentialPublicKey,
            counter: authenticator.counter,
            transports: authenticator.transports,
        },
    });
}
