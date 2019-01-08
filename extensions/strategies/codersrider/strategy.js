var z = require('zero-fill')
  , n = require('numbro')
  , ta_bollinger = require('../../../lib/ta_bollinger')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'codersrider',
  description: 'Buy when (Signal crossesup Lower Bollinger Band) and sell when (Signal crossesdown Upper Bollinger Band).',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '15m')
    this.option('period_length', 'period length, same as --period', String, '15m')
    
    this.option('bollinger_size', 'period size', Number, 25)
    this.option('bollinger_updev', '', Number, 2)
    this.option('bollinger_dndev', '', Number, 2)
    this.option('bollinger_dType','mode: : SMA,EMA,WMA,DEMA,TEMA,TRIMA,KAMA,MAMA,T3', String, 'EMA')
  },

  calculate: function (s) {
    // calculate Bollinger Bands
    //ta_bollinger(s, 'tabollinger', s.options.bollinger_size)
  },

  onPeriod: function (s, cb) {
    if (s.in_preroll) return cb()
    ta_bollinger(s,'tabollinger',s.options.bollinger_size, s.options.bollinger_updev, s.options.bollinger_dndev, s.options.bollinger_dType).
      then(function(inbol){

        let upperBound = inbol.outRealUpperBand[inbol.outRealUpperBand.length-1] 
        let lowerBound = inbol.outRealLowerBand[inbol.outRealLowerBand.length-1] 
        let midBound =inbol.outRealMiddleBand[inbol.outRealMiddleBand.length-1]
        if (!s.period.bollinger) s.period.bollinger = {}

        s.period.bollinger.upperBound = upperBound
        s.period.bollinger.lowerBound = lowerBound
        s.period.bollinger.midBound = midBound
        
        
        if(s.period.open <= lowerBound && s.period.close >= lowerBound) {
           s.signal = 'buy'
        } else if (s.period.open >= upperBound && s.period.close <= upperBound) {
           s.signal = 'sell'
        } else {
           s.signal = null //hold
        }
       cb()
    })
  },

  onReport: function (s) {
    var cols = []
    if (s.period.bollinger) {
      if (s.period.bollinger.upperBound && s.period.bollinger.lowerBound) {
        let upperBound = s.period.bollinger.upperBound
        let lowerBound = s.period.bollinger.lowerBound
        var color = 'grey'
        if (s.period.open <= lowerBound && s.period.close >= lowerBound) {
          color = 'green'
        } else if (s.period.open >= upperBound && s.period.close <= upperBound) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.close).format('+0.00000000'), ' ')[color])
        cols.push(z(8, n(lowerBound).format('0.00000000').substring(0,10), ' ').green)
        cols.push(z(8, n(upperBound).format('0.00000000').substring(0,10), ' ').red)
      }
    }
    else {
      cols.push('         ')
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    bollinger_size: Phenotypes.RangeFactor(10, 25, 1),
    bollinger_updev: Phenotypes.RangeFactor(1, 3.0, 0.1),
    bollinger_dndev: Phenotypes.RangeFactor(1, 3.0, 0.1),
    bollinger_dType: Phenotypes.ListOption(['SMA','EMA','WMA','DEMA','TEMA','TRIMA','KAMA','MAMA','T3']),
    
  }
}
