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
                            "nome":        x.redator,
                            "data":        x.criadoEm.date, 
                            "resumo":      x.componentesDigitais[0].highlights,
                            "criacao":     x.criadoPor.email,
                            "peca":        x.tipoDocumento.nome,
                            "arquivoId":   x.componentesDigitais[0].id,
                            "arquivo":     x.componentesDigitais[0].fileName,
                            "coordenacao":(x.juntadas[0].volume.pasta.setor) ? x.juntadas[0].volume.pasta.setor.nome : 'n/a',
                            "setor":      (x.juntadas[0].volume.pasta.setor) ? x.juntadas[0].volume.pasta.setor.unidade.sigla : 'outros',   
                        });
                    }).filter(e => {
                        return e.nome !== undefined;
                    }); 


        //filtra apenas o ministerio
        lista = lista.filter(e => {
            return e.setor.endsWith("-MC")
        });




        //apenas usuarios da conjur

        /**
        lista = lista.filter(e => {
            return e.criacao.endsWith("@mds.gov.br") || 
                e.criacao.endsWith("@cidadania.gov.br") || 
                        e.criacao.endsWith("@cultura.gov.br") ||
                                e.criacao.endsWith("@cultura.gov.br")
        }); **/

         var ndx = crossfilter(lista);
         var all = ndx.groupAll();

         //dimensao de mj
         var pecasChart = dc.rowChart("#pecasChart");

         var pecasDim = ndx.dimension(function(d){
            return d.peca;
         });
         var pecasGroup = pecasDim.group();

         pecasChart
            .height(320)
            .dimension(pecasDim)
            .group(pecasGroup)
            .elasticX(true)

         
         //resp   
         var respDim = ndx.dimension(function(d){
            return d.nome;
         });

         var respGroup = respDim.group();

         var respChart = dc.rowChart("#respChart")
                            .height(1400)
                            .dimension(respDim)
                            .group(respGroup)
                            .elasticX(true) 

         //setor   
         var setorDim = ndx.dimension(function(d){
            return d.coordenacao;
         });

         var setorGroup = setorDim.group();

         var setorChart = dc.rowChart("#setorChart")
                            .height(250)
                            .dimension(setorDim)
                            .group(setorGroup)
                            .elasticX(true)       

          //grid                           
          var tableDim = ndx.dimension(function(d){
            return d;
          });  

          var tableGroup = tableDim.group();

          var dataTable = dc.dataTable('.dc-data-table');
          dataTable
            .dimension(tableDim)
            .columns([
                "nome",
                "peca",
                "coordenacao",
                {
                   label: "Arquivo",
                   format: function(e){
                        return '<a target="_blank" href="https://sapiens.agu.gov.br/documento/'+e.arquivoId+'">'+e.arquivo+'</a>';
                   }     
                }
             ])


          //count
          var count = dc.dataCount("#dataCount");
              count.dimension(ndx).group(all);    


          dc.renderAll();
    });