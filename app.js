var builder = require('botbuilder');
var restify = require('restify');
var api = require('./api');

const LuisURL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6ffed2ae-7d25-456e-86de-68d97a6bcd1d?subscription-key=376fc739a9034815b3d30eaef6add40f&verbose=true&timezoneOffset=-180&q=";

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());

const recognizer = new builder.LuisRecognizer(LuisURL);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('criar-transacao', [
        (session, args, next) => {
            api.createExpense(args.entities)((error, response) => {
                if (error) {
                    session.send('Error: ' + error);
                }
                else {
                    const createdId = JSON.parse(response.body).id;
                    session.send('Despesa criada com sucesso, id gerado: ' + createdId);
                }
            });
        }
    ])
    .matches('listar-despesas-pendentes', [
        (session) => {
            api.retrievePendingExpenses((error, response) => {
                if (error) {
                    session.send('Error: ' + error);
                }
                else {
                    const json = JSON.parse(response.body);
                    const expenses = json.slice(0, 10).map(exp => exp.description + " R$ " + exp.value).join('\n\r');
                    session.send(expenses);
                }

            });
        }
    ])
    .onDefault((session) => session.send('Não entendi o que deseja'));

bot.dialog('/', intents);