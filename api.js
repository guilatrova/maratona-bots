var request = require('request');

const url = "https://fixdin-api-dev.herokuapp.com/api/v1/expenses/";
const key = "eb3ab36213e0b5cc82ccf7f626c05774d36b5acd"; //maratona@bots.com / 123456
const headers = {
    Authorization: 'Token ' + key,
    'Content-Type': "application/json"
};
const categoryId = 77;
const accountId = 6;

const retrievePendingExpenses = (callback) => {
    let filterUrl = url + '?payed=0';
    request.get(filterUrl, { headers: headers }, callback);
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
    request.post(url, { headers: headers, body: body }, callback);
};

module.exports = {
    retrievePendingExpenses: retrievePendingExpenses,
    createExpense: createExpense
};