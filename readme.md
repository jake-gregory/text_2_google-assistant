# text_2_google-assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)

A Node.js application that communicates with Google Assistant via gRPC, enabling text-based command interaction directly from the terminal

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## Features

- Text based interaction with Google Assistant
- Modular Node.js architecture for easy extension
- Secure oAuth2 credential handling, including automatic token refresh
- Can be used to control home devices if they are set up in Google Home

---

## Installation

Clone the repository and install node_modules (Node.js required):

```bash
git clone https://github.com/jake-gregory/text_2_google-assistant.git
cd text_2_google-assistant
npm install
#Copy oAuth2 credentials token to root directory. See Configuration section for details.
node index.js --command="YOUR_COMMAND_HERE"
```

Or install globally using:
```bash
git clone https://github.com/jake-gregory/text_2_google-assistant.git
cd text_2_google-assistant
#Copy oAuth2 credentials token to root directory (THIS IS CRUCIAL BEFORE NEXT STEP). See Configuration section for details.
npm install -g #You'll need to run this again anytime you make any changes to LANG or RESPONSE variables, as well as change oAuth2 credentials. See Configuration section for details.
text_2_google-assistant --command="YOUR_COMMAND_HERE"
```

---

## Configuration

1. Visit [Google Console](https://console.cloud.google.com/)
2. Create a new project
3. Visit [Google Assistant API](https://console.cloud.google.com/marketplace/product/google/embeddedassistant.googleapis.com) and enable the API for your newly created project
4. Click the burger/ menu icon in the top left corner -> **APIs & Services** -> **Credentials**
5. Click **Create credentials** drop down and select **OAuth client ID**
6. Follow the prompts. Application type should be **Desktop app**
7. You'll be prompted to download the oAuth2 JSON credentials. **This must be saved to the root directory of the application**
8. Click the burger/ menu icon in the top left corner -> **OAuth consent screen** -> **Audience** -> scroll down to **Test users**
9. Add the account of which you'll be logging in to. If you're controlling home devices using this application, this is the account those devices are linked to
10. You can then run the application from the project root using:
```bash
node index.js --command=YOUR_COMMAND_HERE
```
. When running the application for the first time you'll be prompted to login and paste your authentication code into the terminal. This only needs to be done once. Your access token will be generated and will refresh automatically when needed. If there is ever an issue with the access token, you'll be prompted to reauthenticate.

. Google deprecated text based repsonses in 2023, but audible responses are still available. These can be enabled in **index.js** by changing the following to **true**
```javascript
const RESPOND = false
```

. Different languages can also be selected in the **index.js**. Just change **en-GB** to one of the supported languages below:
```javascript
const LANG = 'en-GB'
```
. Supported languages:
| Language | Locale Code |
|---------|-------------|
| 🇩🇪 German (Germany) | `de-DE` |
| 🇦🇺 English (Australia) | `en-AU` |
| 🇨🇦 English (Canada) | `en-CA` |
| 🇬🇧 English (United Kingdom) | `en-GB` |
| 🇮🇳 English (India) | `en-IN` |
| 🇺🇸 English (United States) | `en-US` |
| 🇨🇦 French (Canada) | `fr-CA` |
| 🇫🇷 French (France) | `fr-FR` |
| 🇮🇹 Italian (Italy) | `it-IT` |
| 🇯🇵 Japanese (Japan) | `ja-JP` |
| 🇪🇸 Spanish (Spain) | `es-ES` |
| 🇲🇽 Spanish (Mexico) | `es-MX` |
| 🇰🇷 Korean (South Korea) | `ko-KR` |
| 🇧🇷 Portuguese (Brazil) | `pt-BR` |

[Assistant Locale Source](https://developers.google.com/assistant/sdk/reference/rpc/languages)

---

## Usage

Run the application from the project root:
```bash
node index.js --command="YOUR_COMMAND_HERE"
```
Or if installed globally:
```bash
text_2_google-assistant --command="YOUR_COMMAND_HERE"
```

Example commands for controlling lights associated with Google Home
```bash
node index.js --command=turn the shed lights off
node index.js --command=turn the shed lights blue
node index.js --command=turn all of the lights off
```
Or if installed globally:
```bash
text_2_google-assistant --command=turn the shed lights off
text_2_google-assistant --command=turn the shed lights blue
text_2_google-assistant --command=turn all of the lights off
```

---

## Contributing

Contributions are welcome!

To contribute:

1. Fork the repository  
2. Create a new branch (`git checkout -b feature-name`)  
3. Make your changes  
4. Push the branch to your fork  
5. Open a Pull Request against the `main` branch of this repo  

All contributions must be approved by the project maintainer before being merged.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

**Jake Gregory**
GitHub: [jake-gregory](https://github.com/jake-gregory)

---

## Acknowledgments

- [Google Assistant SDK](https://developers.google.com/assistant/sdk)  
