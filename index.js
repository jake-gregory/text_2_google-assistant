#!/usr/bin/env node

import { grpcAssistant } from "./components/grpc.js";

// Enable or disable audio responses
const RESPOND = false

// Set assistant language
const LANG = 'en-GB'

// Get assistant command from cli args
const args = process.argv.slice(2);

const helpText = "\nPlease specify a command. For example: node index.js --command=YOUR_COMMAND_HERE\n"


if (args.length > 0) {
    // Avoid command formatting errors in command
    const joinedArgs = args.join().replace(/,/g, ' ')

    if (joinedArgs.startsWith('--command=')) {
        // Get plain command to send to assistant
        const assistantCommand = joinedArgs.split('=')[1];

        // Send command to assistant using gRPC and capture returned response
        grpcAssistant(assistantCommand, LANG, RESPOND)

    } else {
        // End if no --command is found
        console.log(helpText)
    }

} else {
    // End if no cli args
    console.log(helpText)
}