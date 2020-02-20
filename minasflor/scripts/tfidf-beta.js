// https://github.com/CodingTrain/website/blob/master/CodingChallenges/CC_040.3_tf-idf/P5/sketch.js


//TODO transformar em classe

        var txt = []
          , counts = {}
          , keys = []
          , allwords = []
          , dataLen = 0;
    

    //s1
    function loadStrings(data) {
        dataLen = data.length;
        data.forEach((f,i)=>{
            txt[i] = f;
        })
    }

    //s2
    function executeFreq() {
        for (var i = 0; i < txt.length; i++) {
            allwords[i] = txt[i]//.join('\n');
        }

        var tokens = allwords[0].split(/\W+/);
        for (var i = 0; i < tokens.length; i++) {
            var word = tokens[i].toLowerCase();
            if (counts[word] === undefined) {
                counts[word] = {
                    tf: 1,
                    df: 1
                };
                keys.push(word);
            } else {
                counts[word].tf = counts[word].tf + 1;
            }
        }

        var othercounts = [];
        for (var j = 1; j < allwords.length; j++) {
            var tempcounts = {};
            var tokens = allwords[j].split(/\W+/);
            for (var k = 0; k < tokens.length; k++) {
                var w = tokens[k].toLowerCase();
                if (tempcounts[w] === undefined) {
                    tempcounts[w] = true;
                }
            }
            othercounts.push(tempcounts);
        }

        for (var i = 0; i < keys.length; i++) {
            var word = keys[i];
            for (var j = 0; j < othercounts.length; j++) {
                var tempcounts = othercounts[j];
                if (tempcounts[word]) {
                    counts[word].df++;
                }
            }
        }

        for (var i = 0; i < keys.length; i++) {
            var word = keys[i];
            var wordobj = counts[word];
            wordobj.tfidf = wordobj.tf * Math.log(dataLen / wordobj.df);
        }

        keys.sort(compare);

        function compare(a, b) {
            var countA = counts[a].tfidf;
            var countB = counts[b].tfidf;
            return countB - countA;
        }

    }


    function getFrequency(){
        const freq = [];

        this.keys.forEach((key, i) => {
            freq.push({
                word:  key,
                freq: counts[key].tfidf
            })
        })

        return freq;
    }
