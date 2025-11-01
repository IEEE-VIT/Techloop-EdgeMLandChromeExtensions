## Email Classifier Chrome Extension

This Chrome extension uses a TensorFlow.js model to classify Gmail emails as important or not, and highlights important emails with a light red background.

## Features

- Automatically runs in Gmail (mail.google.com)
- Loads a pre-trained TensorFlow.js model and tokenizer
- For each email, concatenates sender and subject, predicts with the model
- If the model output is 0, marks the email as important (light red background)

## Install Dependencies

This extension uses Parcel to bundle the content script.

1. Install Node

- Go to https://nodejs.org
- Download the LTS (Long-Term Support) version.
- Run the installer
- After installation, open Terminal / Command Prompt and check:

```
node -v
npm -v
```

2. Buldling the chrome extension

```
   cd Chrome_extension
   npm init -y
   npm install @tensorflow/tfjs parcel
   npm run build
```
