import { google } from 'googleapis';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// ES Module filepath trickery
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the asssistant SDK scope to pass to auth
const assistantScope = [
    'https://www.googleapis.com/auth/assistant-sdk-prototype'
];

const TOKEN_PATH = path.join(__dirname, '../token.json');

// Get credentials.json path
function getCredentials(root) {
    const jsonFiles = fs.readdirSync(root)
        .filter(file => file.endsWith('.json'));

    // Look for .json files with "client_secret" in the name in the root directory
    for (const file of jsonFiles) {
        if (file.includes('client_secret')) {
            return path.join(root, file)
        }
    }
}

// Once authenticated attempt to get access token
async function accessToken(oAuth2Client) {
    try {
        // If theres no issues getting the access token, return access token
        return await oAuth2Client.getAccessToken();
    } catch (err) {
        // If access token has expired (invalid_grant) delete token and re-run auth function
        if (err.response?.data?.error === 'invalid_grant') {
            // Delete token
            await fs.promises.unlink(TOKEN_PATH);
            // As token has been deleted, full reauth will be needed
            return await authenticate();
        } else {
            throw err;
        }
    }
}

export async function authenticate() {
    // Find credentials with client_secret in file name (passing in root directory)
    const CREDENTIALS_PATH = getCredentials(path.join(__dirname, '..'));

    // Ensure credentials exist
    if (!CREDENTIALS_PATH || !fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error('\nPlease ensure your credentials.json is in the root of this project.\n');
    }

    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id } = credentials.installed || credentials.web;

    // Create OAuth2 client. Redirect URI must be urn:ietf:wg:oauth:2.0:oob to work locally
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        "urn:ietf:wg:oauth:2.0:oob"
    );

    if (fs.existsSync(TOKEN_PATH)) {
        // If token already exists, attempt to refresh set it (refresh should happen automatically here)
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        return accessToken(oAuth2Client);
    } else {
        // If token doesn't exist we'll need to run the auth procedure to grab a token
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: assistantScope,
        });

        // Attempt to open auth URL is user's browser of choice
        const shell = spawn('open', [authUrl]);

        shell.stderr.on('data', data => {
            console.error('Failed to open browser: ', err);
            console.log(`\nPlease open the following URL in a browser: ${authUrl}\n`);
        });

        return new Promise((resolve, reject) => {

            // Create cli input
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            // Grab auth code from user
            rl.question('\nPaste the authentication code here: ', (authCode) => {
                rl.close();

                oAuth2Client.getToken(authCode, (err, token) => {
                    if (err) {
                        console.error("Error retrieving access token:\n", err);
                        return reject(err);
                    }

                    console.log("\nAuthentication successful!\n");

                    //Write token to root directory
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                    oAuth2Client.setCredentials(token);
                    resolve(accessToken(oAuth2Client))
                });
            });
        })
    }
}
