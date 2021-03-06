var z = require('zero-fill'),
  n = require('numbro'),
  highest = require('../../../lib/highest'),
  lowest = require('../../../lib/lowest'),
  Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'ichimoku',
  description: 'Ichimoku Cloud',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '15m')
    this.option('period_length', 'period length', String, '15m')
    this.option('min_periods', 'min periods (should be >= senkou_b option)', Number, 52)
    this.option('tenkan', 'Tenkan (conversion) line', Number, 9)
    this.option('kijun','Kijun (base) line', Number, 26)
    this.option('senkou_b','Senkou (leading) span B', Number, 52)
    this.option('chikou','Chikou (lagging) span)', Number, 26)
  },

  calculate: function (s) {
  },

  onPeriod: function (s, cb) {
    if (s.lookback[s.options.min_periods]) {
      
      highest(s, 'tenkan_high', s.options.tenkan)
      lowest(s, 'tenkan_low', s.options.tenkan)
      highest(s, 'kijun_high', s.options.kijun)
      lowest(s, 'kijun_low', s.options.kijun)
      highest(s, 'senkou_high', s.options.senkou_b)
      lowest(s, 'senkou_low', s.options.senkou_b)

      s.period.tenkan = ((s.period.tenkan_high + s.period.tenkan_low) / 2)
      s.period.kijun = ((s.period.kijun_high + s.period.kijun_low) / 2)
      s.period.senkou_a = ((s.period.tenkan + s.period.kijun) / 2)
      s.period.senkou_b = ((s.period.senkou_high + s.period.senkou_low) / 2)
      s.period.chikou = s.lookback[s.options.chikou - 1].close
      
      let currentSenkouA = s.lookback[s.options.chikou - 1].senkou_a
      let currentSenkouB = s.lookback[s.options.chikou - 1].senkou_b
      
      let upperBound = Math.max(currentSenkouA, currentSenkouB)
      let lowerBound = Math.min(currentSenkouA, currentSenkouB)

      /*
      
      // Tenkan is Above Kijun and Kumo Breakout Happens
      if (s.period.tenkan > s.period.kijun && s.period.close > upperBound && (s.lookback[1].close <= upperBound)) {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      }
      
      // Strong TenkenKijun Cross 
      let prevTenkanBelowKijun = (s.lookback[1].tenkan <= s.lookback[1].kijun)
      let currentTenkanAboveKijun = (s.period.tenkan > s.period.kijun)
      let priceAboveKumo = (s.period.close >= upperBound)
      
      if(prevTenkanBelowKijun && currentTenkanAboveKijun && priceAboveKumo){
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      }
      */
      
      // Kumo Breakout
      if (s.period.close > upperBound && (s.lookback[1].close <= upperBound)) {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      }
      
      let prevKijunBelowTenkan = (s.lookback[1].kijun <= s.lookback[1].tenkan)
      if(s.period.kijun > s.period.tenkan && prevKijunBelowTenkan){
        if (s.trend !== 'down') {
          s.acted_on_trend = false
        }
        s.trend = 'down'
        s.signal = !s.acted_on_trend ? 'sell' : null
      }
      
      
      /*
      if (s.period.close < Math.min(s.period.senkou_a, s.period.senkou_b)) {
        if (s.trend !== 'down') {
          s.acted_on_trend = false
        }
        s.trend = 'down'
        s.signal = !s.acted_on_trend ? 'sell' : null
      }
      */
      
      
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if(s.period.senkou_a && s.period.senkou_b){
      
        let currentSenkouA = s.lookback[s.options.chikou - 1].senkou_a
        let currentSenkouB = s.lookback[s.options.chikou - 1].senkou_b
       
        let upperBound = Math.max(currentSenkouA, currentSenkouB)
        let lowerBound = Math.min(currentSenkouA, currentSenkouB)
      
        var color = 'grey'
        if (s.period.close > upperBound) {
          color = 'green'
        }
        if (s.period.close < lowerBound) {
          color = 'red'
        }
        //cols.push(z(8, n(s.period.close).format('0.00000000'), ' ')[color])
        if(s.trend === 'down') {
           cols.push(z(8, n(lowerBound).format('0.00000000').substring(0,10), ' ').red)
           cols.push(' ')
           cols.push(z(8, n(upperBound).format('0.00000000').substring(0,10), ' ').red)
        }
        if(s.trend === 'up'){
           cols.push(z(8, n(s.period.tenkan).format('0.00000000').substring(0,10), ' ').green)
           cols.push(' ')
           cols.push(z(8, n(s.period.kijun).format('0.00000000').substring(0,10), ' ').green)
        }
        
    }
    
    return cols
  },

  phenotypes: {
    //General Options
    period_length: Phenotypes.RangePeriod(5, 120, 'm'),
    min_periods: Phenotypes.Range(150, 150), //(should be >= senkou_b option)
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    //Strategy Specific
    tenkan: Phenotypes.RangeFactor(5, 30, 1),
    kijun: Phenotypes.RangeFactor(25, 75, 1),
    senkou_b: Phenotypes.RangeFactor(50, 150, 1),
    chikou: Phenotypes.RangeFactor(20, 40, 1)
  }
}
