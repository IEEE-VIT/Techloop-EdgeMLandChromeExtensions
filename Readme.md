# EMAIL HIGHLIGHTER - Chrome Extension

A Chrome Extension that integrates Machine Learning directly in the browser using TensorFlow.js to classify Gmail emails as important or not important, automatically highlighting important ones with a subtle red tint.

This project demonstrates Edge Machine Learning, bringing intelligence to the client-side using a model built and converted from TensorFlow/Keras.

## Features

- Automatically runs in Gmail (mail.google.com)
- Loads a pre-trained TensorFlow.js model and tokenizer
- For each email, concatenates sender and subject, predicts with the model
- If the model output is 0, marks the email as important (light red background)

## Setup Instructions

This extension uses Parcel to bundle the content script.

### 1. Install Node

- Go to https://nodejs.org
- Download the LTS (Long-Term Support) version.
- Run the installer
- After installation, open Terminal / Command Prompt and check:

```
node -v
npm -v
```

### 2. Buldling the chrome extension

```
   cd Chrome_extension
   npm init -y
   npm install @tensorflow/tfjs parcel
   npm run build
```

### 3. Load the Extension in Chrome

1.  Open Chrome and go to `chrome://extensions/`
2.  Enable "Developer mode"
3.  Click "Load unpacked" and select the `Chrome_extension` folder

### 4. Usage

- Go to [Gmail](https://mail.google.com/)
- The extension will automatically classify emails in your inbox
- Emails predicted as important (model output 0) will have a light red background

## Files and Folders

```
📁 TECHLOOP-EDGEMLANDCHROMEEXTENSIONS/
│
│
├── 📁 Chrome_extension/                # Chrome Extension source folder
│   ├── manifest.json                   # Chrome Extension configuration and permissions
│   ├── content.js                      # Content script that runs on Gmail to classify emails
│   ├── package.json                    # Dependencies and scripts needed to build or run the extension.
│   ├── package-lock.json
│   ├── 📁 dist/                        # Auto-generated folder after Parcel build
│   │   ├── content.js                  # Bundled optimized script used by Chrome
|   |   └── 📁 model/                   # Additional copy of the model files
│   └── 📁 model/                       # Local copy of model files used by the extension, downloaded from the colab notebooks
│       ├── model.json
│       ├── group1-shard1of1.bin
│       ├── model.h5
│       └── tokenizer_vocab.json
│
├── 📁 Colab Notebooks/                 # Colab NoteBooks for the Classification Model
│   ├── diabetes-practice.ipynb          # Notebook to practice creating classification model
│   └── EmailClassifier.ipynb            # Notebook to train and test the email classifier model
│
├── 📁 Data Sets/                       # Data sets used for training the models
│   ├── diabetes.csv                    # Diabetes data set for practice
│   └── emails.xlsx                     # Main data set for training the Email classifier
│
└── README.md                           # Complete documentation for setup and usage

```
