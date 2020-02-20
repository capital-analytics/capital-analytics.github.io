execute();

var dictionary = [];

function execute(){
    d3.dsv(';', 'data/training.csv').then(data => {

         const inputs  = data.map(m => m.indicacao);
         const outputs = data.map(m => m.produto);

         const wc = new TFIDF();

        
         wc.termFreq(inputs.join('\n'));
         wc.docFreq(inputs.join('\n'));
         
         wc.finish(inputs.lenth);

         console.log(wc.getKeys())

         return;

         dictionary = buildDictionary(data);

         const trainingData = [];

         data.forEach((f, i) => {
             trainingData.push({
                 input:  encode(inputs[i]),
                 output: { [outputs[i]]: 1 },
             }) 
         })


       //const net = new brain.recurrent.LSTM();

        const net = new brain.NeuralNetwork({ 
                    hiddenLayers: [30, 10]
                });
            
        const stats = net.train(trainingData);
        console.log(stats);

        const encoded = encode(['','','alta_pigmentação'].join(' '))
        console.log(encoded)
        console.log(brain.likely(encoded, net));

    })
}

function buildDictionary(data){
    const tokenizeArray = data.map(m => {
        return m.indicacao.split(' ');
    })

    const flattenedArray = [].concat.apply([], tokenizeArray);
    return flattenedArray.filter((item, pos, self) => self.indexOf(item) == pos)
}


function encode (phrase) {
  const phraseTokens = phrase.split(' ')
  const encodedPhrase = dictionary.map(word => phraseTokens.includes(word) ? 1 : 0)

  return encodedPhrase
}



