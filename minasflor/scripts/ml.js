execute();

var dictionary = [];

function execute(){
    d3.dsv(';', 'data/training_2.csv').then(data => {

         const inputs  = data.map(m => m.indicacao);
         const outputs = data.map(m => m.produto);


         dictionary = buildDictionary(inputs);

         //console.log(dictionary);

         const normalized_inputs = inputs.map(normalize)

         const trainingData = [];

         data.forEach((f, i) => {
             trainingData.push({
                 input:  { [normalized_inputs[i]]: 1},
                 output: { [outputs[i]]: 1 } 
                 /** input:  normalized_inputs[i],
                 output: [(i+1)/outputs.length] **/
             }) 
         })

        const net = new brain.NeuralNetwork({
            hiddenLayers: [4, 4],
            learningRate: 0.6, // global learning rate, useful when training using streams
            binaryThresh: 0.5,
            activation: 'tanh'
        });
            
        const stats = net.train(trainingData, {
             errorThresh: 0.005,
             learningRate: 0.3,
             iterations: 50000,
             logPeriod: 100,
             log: (stats) => console.log(stats)
        });

        
        //console.log(stats);

        //const encoded = encode(['','','alta_pigmentação'].join(' '))
        //console.log(encoded)
        var pos = 20;
        
        console.log("entrada: ",             inputs[pos])
        console.log("entrada normalizada: ", normalize(inputs[pos]))
        console.log("previsao: ",            net.run(normalize(inputs[pos])));
        console.log("saida: ",               trainingData[pos].output)

        //console.log(brain.likely(normalize(inputs[pos]), net));
    })
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function normalize(data){
    var norm = data.split(' ').filter(f => f.length > 1).map(m => round(dictionary.indexOf(m) / dictionary.length, 3)) 
    while(norm.length < 4) { norm.push(0.01) }
    return norm;//.splice(0, 4);
    //return dictionary.indexOf(data) / dictionary.length;
}

function buildDictionary(data){
    const tokenizeArray = data.map(m => {
        return m.split(' ');
    })

    const flattenedArray = [].concat.apply([], tokenizeArray);
    return Array.from(new Set(flattenedArray));
}


function round(n, c){
   return Number(Number(n).toFixed(c));
}




