function parseDataset(){
    d3.json('data/dataset.json').then(data => {

        data = data.filter(f => {
            return f.details != null
        })

        data.forEach(f => {
            console.log(parse(f.details), '-', f.title, "-", f.parentUrlSeo);
        })

         /** document.open();
         data.forEach(f => {
            document.write('<h3> ' + f.title + '</h3> ') 
            document.write(f.details)
         })  
         document.close(); **/
    })
}

function parse(str){
    return (str.match(/<p>(.*?)<br \/>/g)) ? str.match(/<p>(.*?)<br \/>/g).map(m => {
       return m.replace(/(&nbsp;|<([^>]+)>)/ig,'');
    }).join('') : ''//str.match(/<span .*>/g)
}

execute();

function execute(){
    d3.dsv(';', 'data/training.csv').then(data => {

         const inputs = data.map(m => m.indicacao);
         const outputs = data.map(m => m.produto);



        //frequence(inputs.join(' '))
        
         const trainingData = [];

         data.forEach((f, i) => {
             trainingData.push({
                 input: { [inputs[i]]: 1 },
                 output: { [outputs[i]]: 1 },
             }) 
         })

         

        const net = new brain.NeuralNetwork({ hiddenLayers: [20] });
        const stats = net.train(trainingData);

        console.log(stats);

          

        console.log(brain.likely({['recuperação', 'profissional', 'fibra_capilar']: 1}, net));

        /** const res = brain.likely('fragilizados', 'ressecados', 'quimicamente_processados'], net);
        console.log(res);**/
    })
}



function frequence(data){
     var f = new TFIDF();

     f.termFreq(data);
     f.docFreq(data)

     f.sortByScore()

     console.log(f.getKeys());
}

function dict(){
    var x = ['água', 'cabeção', 'cascão', 'profissão', 'exceção', 'agua_marinha']

    var y = x.map(f => {
        return f.replace(/[^a-zA-Z0-9]/g,'*')
    })

   data = x;

   var keyPair = [];
   data.forEach((f, i) => {
        var obj = {};
            obj.key = x[i];
            obj.values = y[i];
        keyPair.push(obj);
   })


   return x.reduce((obj, i) => {
       return  obj[i] = obj 
   }, {});


}

//var x = JSON.stringify(dict())
//console.log(Object.entries(dict()));