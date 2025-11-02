import * as tf from '@tensorflow/tfjs';
console.log('EmailClassifier loaded');

(async function(){
    let model, tokenizer;

    function sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async function loadTokenizerConfig(){
        const res = await fetch(chrome.runtime.getURL('model/tokenizer_config.json'));
        if (!res.ok) {
            throw new Error(`Failed to load tokenizer config: ${res.statusText}`);
        }
        const json = await res.json();
        return json;
    }

    class Tokenizer {
        constructor(config) {
            this.wordIndex = config.word_index || {};
            this.oovTocken = config.oov_token || "<OOV>";
            this.maxLen = config.max_len || 50;
        }

        textstoSequences(texts) {
            return texts.map(text => text.toLowerCase().split(/\s+/).map(word => {
                this.wordIndex[word] || this.wordIndex[this.oovTocken] ||1;
            }))
        }

        padSequences(sequences) {
            return sequences.map(seq => {
                const padded = seq.slice(0,this.maxLen);
                while (padded.length < this.maxLen){
                    padded.push(0);
                }
                return padded;
            })
        }
    }
})();