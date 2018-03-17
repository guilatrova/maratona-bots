var request = require('request');

const url = "http://maratona-bots-api.azurewebsites.net/api/";

const retrievePendingExpenses = (callback) => {    
    request.get(url + "expenses", callback);
};

const createExpense = (entities) => (callback) => {
    const content = {
        description: entities.find(e => e.type == "descricao").entity,
        due_date: '2018-02-16',
        value: "-" + entities.find(e => e.type == "builtin.currency").entity.replace(',', '.').replace(/[^0-9.]/g,''),
        account: accountId,
        category: categoryId
    };
    const body = JSON.stringify(content);
    request.post(url + "create", { body: body }, callback);
};

module.exports = {
    retrievePendingExpenses: retrievePendingExpenses,
    createExpense: createExpense
};