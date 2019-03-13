var z = require('zero-fill')
  , n = require('numbro')
  , sma = require('../../../lib/sma')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
    name: 'coinmover',
    description: 'Stable Coin Mover - Small Profit.',
    
    getOptions: function(){
        this.option('period', 'period length, same as --period_length', String, '1h')
        this.option('period_length', 'period length, same as --period', String, '1h')
        this.option('min_periods', 'min. number of history periods', Number, 52)
        this.option('sma_period', 'number of periods for SMA', Number, 100)
    },
    
    calculate: function(s){
        
    },
    
    onPeriod: function(s, cb){
        
    },
    
    onReport: function(s){
        
    },
    
    phenotypes: {
        
    }
}
