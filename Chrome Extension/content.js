import * as tf from '@tensorflow/tfjs';

console.log('[EmailClassifier] Script loaded');

(async function() {
  // Helper: sleep
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Load tokenizer config
  async function loadTokenizerConfig() {
    console.log('[EmailClassifier] Loading tokenizer config...');
    const resp = await fetch(chrome.runtime.getURL('model/tokenizer_vocab.json'));
    if (!resp.ok) throw new Error('Failed to fetch tokenizer_vocab.json');
    const json = await resp.json();
    console.log('[EmailClassifier] Tokenizer config loaded');
    return json;
  }

  // SimpleTokenizer class (copied from index.html)
  class SimpleTokenizer {
    constructor(config) {
      this.wordIndex = config.word_index || {};
      this.oovToken = config.oov_token || '<OOV>';
      this.maxLen = config.max_len || 50;
    }
    textsToSequences(texts) {
      return texts.map(text => {
        return text.toLowerCase().split(/\s+/).map(word =>
          this.wordIndex[word] || this.wordIndex[this.oovToken] || 1
        );
      });
    }
    padSequences(sequences) {
      return sequences.map(seq => {
        const padded = seq.slice(0, this.maxLen);
        while (padded.length < this.maxLen) padded.push(0);
        return padded;
      });
    }
  }

  // Load model
  async function loadModel() {
    console.log('[EmailClassifier] Loading model...');
    const model = await tf.loadLayersModel(chrome.runtime.getURL('model/model.json'));
    console.log('[EmailClassifier] Model loaded');
    return model;
  }

  // Wait for Gmail thread list to appear
  async function waitForEmailRows() {
    let rows;
    for (let i = 0; i < 30; ++i) { // up to ~15s
      rows = document.querySelectorAll('tr.zA');
      if (rows.length > 0) {
        console.log(`[EmailClassifier] Found ${rows.length} email rows`);
        return rows;
      }
      await sleep(500);
    }
    throw new Error('Could not find Gmail email rows.');
  }

  // Main logic
  let model, tokenizer;
  try {
    const tokenizerConfig = await loadTokenizerConfig();
    tokenizer = new SimpleTokenizer(tokenizerConfig);
    model = await loadModel();
  } catch (e) {
    console.error('[EmailClassifier] Failed to load model/tokenizer:', e);
    return;
  }

  // Classify and highlight emails
  async function classifyAndHighlight() {
    const rows = document.querySelectorAll('tr.zA');
    console.log(`[EmailClassifier] Classifying ${rows.length} email rows`);
    for (const row of rows) {
      // Avoid re-processing
      if (row.dataset.classified) continue;
      row.dataset.classified = '1';
      // Extract sender and subject
      const senderElem = row.querySelector('.yX.xY .yP, .yX.xY .zF');
      const subjectElem = row.querySelector('.y6 span[id], .y6 span:not([id])');
      if (!senderElem || !subjectElem) {
        console.log('[EmailClassifier] Skipping row: missing sender or subject');
        continue;
      }
      const sender = senderElem.textContent.trim();
      const subject = subjectElem.textContent.trim();
      const inputText = sender + ' ' + subject;
      console.log(`[EmailClassifier] Processing: "${inputText}"`);
      // Tokenize and predict
      const seq = tokenizer.textsToSequences([inputText]);
      console.log('Tokenized sequence:', seq);
      const padded = tokenizer.padSequences(seq);
      console.log('Padded sequence:', padded);
      const input = tf.tensor2d(padded, [1, tokenizer.maxLen]);
      let pred, data;
      try {
        pred = model.predict(input);
        data = await pred.data();
      } catch (err) {
        console.error('[EmailClassifier] Prediction error:', err);
        input.dispose();
        if (pred) pred.dispose();
        continue;
      }
      input.dispose();
      pred.dispose();
      console.log(`[EmailClassifier] Prediction for "${inputText}":`, data);
      if (data[0] < 0.5) {
        row.style.background = '#ffd6d6'; // light red
        console.log(`[EmailClassifier] Marked as important: "${inputText}"`);
      }
    }
  }

  // Observe DOM changes to classify new emails
  const observer = new MutationObserver(() => {
    console.log('[EmailClassifier] DOM changed, reclassifying...');
    classifyAndHighlight();
  });
  const main = document.querySelector('div[role=main]');
  if (main) {
    observer.observe(main, { childList: true, subtree: true });
    console.log('[EmailClassifier] MutationObserver attached');
  } else {
    console.warn('[EmailClassifier] Could not find main container for MutationObserver');
  }

  // Initial run
  await waitForEmailRows();
  classifyAndHighlight();
})(); 