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

    async function loadModel(){
        const model = await tf.loadLayersModel(chrome.runtime.getURL('model/model.json'));
        return model;
    }

    try {
        const tokenizerConfig = await loadTokenizerConfig();
        tokenizer = new Tokenizer(tokenizerConfig);
        model = await loadModel();
    } catch (e){
        console.error("error loading the tokenizer or model",e);
        return;
    }

    async function watiForEmailRows(){
        let rows;
        for (let i=0;i<30;i++){
            rows = document.querySelectorAll('tr.zA');
            if (rows.length >0){
                return rows;
            }
            await sleep(500);
        }
        throw new Error("no emails found");
    }

    async function classifyandHighlight(){
        const rows = document.querySelectorAll('tr.zA');
        for (const row of rows){
            const senderElement = row.querySelector('.yX.xY .yP.xY .zF');
            const subjectElement = row.querySelector('.y6 span[id] , .y6 span:not([id])');
            if (!senderElement || !subjectElement){
                continue;
            }
            const sender = senderElement.textContent.trim();
            const subject = subjectElement.textContent.trim();
            const inputText = sender + " " + subject;

            const seq = tokenizer.textstoSequences([inputText]);
            const paddedSeq = tokenizer.padSequences(seq);
            const input = tf.tensor2d(paddedSeq, [1, tokenizer.maxLen]);
            let prediction,data;
            try {
                pred = model.predict(input);
                data = await pred.data();
            } catch (e){
                console.error("error during prediction",e);
                input.dispose();
            }
            if (data[0]<0.5){
                row.slyle.background = '#ff0000'
            }
        }
    }

    await watiForEmailRows();
    classifyandHighlight();

})();