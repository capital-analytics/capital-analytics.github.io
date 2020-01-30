Highcharts.stockChart('container', {
    yAxis: [{
        labels: {
            align: 'left'
        },
        height: '80%',
        resize: {
            enabled: true
        }
    }, {
        labels: {
            align: 'left'
        },
        top: '80%',
        height: '20%',
        offset: 0
    }],
    plotOptions: {
        series: {
            cursor: 'pointer',
            point: {
                events: {
                    click: function(e) {
                         
                    }
                }
            }
        }
    },
    tooltip: {
        shape: 'square',
        headerShape: 'callout',
        borderWidth: 0,
        shadow: false,
        positioner: function(width, height, point) {
            var chart = this.chart, position;

            if (point.isHeader) {
                position = {
                    x: Math.max(// Left side limit
                    chart.plotLeft, Math.min(point.plotX + chart.plotLeft - width / 2, // Right side limit
                    chart.chartWidth - width - chart.marginRight)),
                    y: point.plotY
                };
            } else {
                position = {
                    x: point.series.chart.plotLeft,
                    y: point.series.yAxis.top - chart.plotTop
                };
            }

            return position;
        }
    },
    series: [{
        type: 'candlestick',
        id:   'aapl-ohlc',
        name: 'BTC',
        data: getCotacoes()
    }, {
        type: 'column',
        id:   'aapl-volume',
        name: 'volume',
        data: getVolume(),
        yAxis: 1
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 800
            },
            chartOptions: {
                rangeSelector: {
                    inputEnabled: false
                }
            }
        }]
    }
});
