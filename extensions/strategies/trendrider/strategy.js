var z = require('zero-fill')
  , n = require('numbro')
  , ema = require('../../../lib/ema')
  , stddev = require('../../../lib/stddev')
  , Phenotypes = require('../../../lib/phenotype')
  
  module.exports = {
	  name : 'trendrider',
	  description : 'Bollinger Band Trend Rider.',
	  
	  getOptions: function(){
		  this.option('bollinger_period', 'bollinger period', Number, 25)
		  this.option('standard_deviation','standard deviation', Number, 2)
	  },
	  
	  calculate: function(s){
		  if(!s.in_preroll){
			  ema(s, 'ema', s.options.bollinger_period)
			  stddev(s, 'stddev', s.options.bollinger_period)
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
			  
			  cb()
		  }
		  cb()
		  
	  },
	  
	  onReport: function(s){
		  var cols = []
		  if(s.period.lower && s.period.upper) {
			  let lowerBound = s.period.lower
			  let upperBound = s.period.upper
			  cols.push(z(8, n(lowerBound).format('0.00000000').substring(0,10), ' ').green)
			  cols.push(' ')
			  cols.push(z(8, n(upperBound).format('0.00000000').substring(0,10), ' ').red)
		  }
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
  


  
