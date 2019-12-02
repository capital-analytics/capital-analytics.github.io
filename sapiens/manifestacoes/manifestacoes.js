   const dados = d3.json("data/manifestacoes4.json", d => ({
              registros: d,
        }));

    var grid = [];

    dados.then(data => {
        data.forEach((e, i) => {
            //console.log(e[i][0]);

            if(e[i] !== undefined){
                e[i][0].result.records.forEach(r => {
                    grid.push(r);
                })
            }
        })

        //console.log(grid);  

        var lista = grid.map(x => {
                        return ({
                            "nome":     x.redator,
                            "data":     x.criadoEm.date, 
                            "resumo":   x.componentesDigitais[0].highlights,
                            "peca":     x.tipoDocumento.nome,
                            "arquivo":  x.componentesDigitais[0].id,
                            "setor":    (x.juntadas[0].volume.pasta.setor) ? x.juntadas[0].volume.pasta.setor.nome : ''
                        });
                    }).filter(e => {
                        return e.nome !== undefined;
                    });


        lista = lista.filter(e => {
            return e.setor.endsWith("MC") || e.setor.endsWith("PROTOCOLO");
        });

         var ndx = crossfilter(lista);
         var all = ndx.groupAll();

         //dimensao de mj
         var pecasChart = dc.rowChart("#pecasChart");

         var pecasDim = ndx.dimension(function(d){
            return d.peca;
         });
         var pecasGroup = pecasDim.group();

         pecasChart
            .height(300)
            .dimension(pecasDim)
            .group(pecasGroup)
            .elasticX(true)

         
         //resp   
         var respDim = ndx.dimension(function(d){
            return d.nome;
         });

         var respGroup = respDim.group();

         var respChart = dc.rowChart("#respChart")
                            .height(1200)
                            .dimension(respDim)
                            .group(respGroup)
                            .elasticX(true) 

         //setor   
         var setorDim = ndx.dimension(function(d){
            return d.setor;
         });

         var setorGroup = setorDim.group();

         var setorChart = dc.rowChart("#setorChart")
                            .height(250)
                            .dimension(setorDim)
                            .group(setorGroup)
                            .elasticX(true)                

         dc.renderAll();
    });