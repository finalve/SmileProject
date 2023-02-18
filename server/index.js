'use strict'

const { Spot } = require('@binance/connector');

const apiKey = 'pQHZnNrAQ8I0lHHsNKrk8VCSDeSmcBwVvBsxWqBF6ymRY1B6RMXNo3Y6optOPFjN'
const apiSecret = 'LYuvnjN6PoFVDk685zBK9cGjYkh9tC4n32DVgVvYbPcZe56kaVx72yxhjH7VnjgC'
const client = new Spot(apiKey, apiSecret)

client.openOrders()
  .then(response => client.logger.log(response.data))
  .catch(error => client.logger.error(error))