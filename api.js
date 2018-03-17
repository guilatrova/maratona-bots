var request = require('request');

const url = "http://maratona-bots-api.azurewebsites.net/api/";
const headers = { 'Content-Type': "application/json" };
const categoryId = 77;
const accountId = 6;

const retrievePendingExpenses = (callback) => {    
    request.get(url + "expenses", { headers: headers } , callback);
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
    request.post(url + "create", { headers: headers, body: body }, callback);
};

module.exports = {
    retrievePendingExpenses: retrievePendingExpenses,
    createExpense: createExpense
};