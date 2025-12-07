import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from 'path';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { authenticate } from "./authentication.js";
import { playRawPCM } from "./wav.js";

// ES Module filepath trickery
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up audio save file paths
const AUDIO_FOLDER = path.join(__dirname, "../response")
const AUDIO_FILE = "assistant_response.wav"

const PROTO_PATH = path.join(__dirname, '../protos/google/assistant/embedded/v1alpha2/embedded_assistant.proto');
const ENDPOINT = "embeddedassistant.googleapis.com";

// Create instance of client with user credentials and store access token
const accessToken = await authenticate();

// Proto config
const definition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    enums: String,
    defaults: true,
    oneofs: true,
    // Set relative path here for imports within other proto files
    includeDirs: [path.join(__dirname, '../protos')],
});

// Load proto file
const proto = grpc.loadPackageDefinition(definition).google.assistant.embedded.v1alpha2;

// gRPC credentials processing
const ssl = grpc.credentials.createSsl();
const callCreds = oauthToCallCredentials();
const combinedCreds = grpc.credentials.combineChannelCredentials(ssl, callCreds);

// Create new assistant instance using proto
const assistant = new proto.EmbeddedAssistant(ENDPOINT, combinedCreds);

// Array to save audio buffer if response is enabled
const audioChunks = []

const call = assistant.assist();

// Convert OAuth client to gRPC metadata
function oauthToCallCredentials() {
    return grpc.credentials.createFromMetadataGenerator(async (_, callback) => {
        try {
            const md = new grpc.Metadata();
            md.add("authorization", `Bearer ${accessToken.token}`);
            callback(null, md);
        } catch (err) {
            callback(err);
        }
    });
}

export function grpcAssistant(command, respond) {
    // Send a single text query to assistant
    call.write({
        config: {
            audio_out_config: {
                encoding: "LINEAR16",
                sample_rate_hertz: 24000,
                volume_percentage: 100
            },
            device_config: {
                device_id: "my-device",
                device_model_id: "my-model"
            },
            dialog_state_in: {
                language_code: "en-GB"
            },
            text_query: command
        }
    });

    call.on("error", (err) => console.error("gRPC error: ", err));

    // Add audio data to the buffer if responses are enabled
    call.on("data", (response) => {
        if (response.audio_out?.audio_data && respond == true) {
            audioChunks.push(response.audio_out.audio_data);
        }
    });

    // Once the response has finished, do this
    call.on("end", () => {

        // If responses are enabled process the audio buffer. If not, were done here 😎
        if (audioChunks.length && respond == true) {
            // Join buffer array into one
            const audioBuffer = Buffer.concat(audioChunks);

            // Create new directory for audio if !exists
            try {
                if (!fs.existsSync(AUDIO_FOLDER)) {
                    fs.mkdirSync(AUDIO_FOLDER);
                }
            } catch (err) {
                console.error(err);
            }

            // Pass raw audio buffer to wav component to process and play the audio
            playRawPCM(path.join(AUDIO_FOLDER, AUDIO_FILE), audioBuffer)
        }

    });

    call.end();
}