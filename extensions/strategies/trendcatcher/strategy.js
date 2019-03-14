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
      
        if(!s.in_preroll && s.lookback.length > s.options.sma_period){            
            // Calculate EMA and SMA
            ema(s, 'ema', s.options.ema_period)
            sma(s, 'sma', s.options.sma_perios)
            
            // Calculate HA Candle
            s.period.ha_close = (s.period.open + s.period.high + s.period. close + s.period.low)/4
            s.period.ha_open = (s.lookback[1].open + s.lookback[1].close )/2
            s.period.ha_high = Math.max(s.period.high, s.period.open, s.period.close)
            s.period.ha_low = Math.min(s.period.low, s.period.open, s.period.close) 
		  }
	  },
	  
	  onPeriod: function(s, cb){
		  
		  if(!s.in_preroll){
              
              // UP TREND
              if(s.period.ema > s.period.sma && s.period.ha_close > s.period.ha_open) {
                if (s.trend !== 'up') {
                      s.acted_on_trend = false
                }
                s.trend = 'up'
                s.signal = !s.acted_on_trend ? 'buy' : null
                  
              } 
              
              // DOWN TREND
              if(s.period.ha_close < s.period.ha_open) {
                if (s.trend !== 'down') {
                      s.acted_on_trend = false
                }
                s.trend = 'down'
                s.signal = !s.acted_on_trend ? 'sell' : null
              } 
              
			  return cb()
		  }
		  cb()
		  
	  },
	  
	  onReport: function(s){
		  var cols = []
      //console.log(s.period)
		  if(s.period.ema && s.period.sma) {
			  let ha_close = s.period.ha_close
			  let ha_open = s.period.ha_open
              cols.push('TREND '+s.trend)
              cols.push(' ')
              cols.push(ha_close - ha_open)
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
  
