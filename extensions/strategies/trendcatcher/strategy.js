// @Author: Ujesh Lal
// Strat Name: TrendCatcher
// Date: 13-Mar-2019

var z = require('zero-fill')
  , n = require('numbro')
  , ema = require('../../../lib/ema')
  , sma = require('../../../lib/sma')
  , Phenotypes = require('../../../lib/phenotype')
  
  module.exports = {
	  name : 'trendcatcher',
	  description : 'EMA/SMA HA.',
	  
	  getOptions: function(){
		  this.option('ema_period', 'ema period', Number, 7)
		  this.option('sma_period','sma period', Number, 21)
	  },
	  
	  calculate: function(s){
       //console.log('LOOKBACK LEN: '+s.lookback.length)
		  if(!s.in_preroll && s.lookback.length > s.options.bollinger_period){
        ema(s, 'ema', s.options.bollinger_period)
			  stddev(s, 'stddev', s.options.bollinger_period, 'close')
			  s.period.upper = (s.period.ema) + (s.options.standard_deviation * s.period.stddev)
			  s.period.lower = (s.period.ema) - (s.options.standard_deviation * s.period.stddev)
			  
		  }
	  },
	  
	  onPeriod: function(s, cb){
		  
		  if(!s.in_preroll){
			  if(s.period.open <= s.period.lower && s.period.close >= s.period.lower) {
				  s.signal = 'buy'
			  } else if(s.period.open >= s.period.upper && s.period.close <= s.period.upper) {
				  s.signal = 'sell'
			  } else {
				  s.signal = null //hold
			  }
			  
			  return cb()
		  }
		  cb()
		  
	  },
	  
	  onReport: function(s){
		  var cols = []
      //console.log(s.period)
		  if(s.period.lower && s.period.upper) {
			  let lowerBound = s.period.lower
			  let upperBound = s.period.upper
			  cols.push(z(4, n(upperBound).format('0.000000000').substring(5,11), ' ').red)
			  cols.push(' ')
        cols.push(z(4, n(s.period.ema).format('0.000000000').substring(5,11), ' ').white)
        cols.push(' ')
			  cols.push(z(4, n(lowerBound).format('0.000000000').substring(5,11), ' ').green)
		  } else {
			  cols.push('.......... ' + s.lookback.length)
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
		bollinger_period: Phenotypes.RangeFactor(10, 50, 1),
		standard_deviation: Phenotypes.RangeFactor(1, 3.0, 0.1)
	}
	
  }
  
