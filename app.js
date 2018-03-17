var builder = require('botbuilder');
var restify = require('restify');
var botbuilder_azure = require("botbuilder-azure");
var api = require('./api');

const LuisURL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6ffed2ae-7d25-456e-86de-68d97a6bcd1d?subscription-key=376fc739a9034815b3d30eaef6add40f&verbose=true&timezoneOffset=0&q="
const isDebug = false;

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector);
if (isDebug) {
    bot.set('storage', new builder.MemoryBotStorage());
}
else {
    const tableName = 'botdata';
    const azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
    const tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
    bot.set('storage', tableStorage);
}

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
                    if (expenses) {
                        session.send(expenses);
                    }
                    else {
                        session.send("Não há despesas para listar");
                    }
                }

            });
        }
    ])
    .onDefault((session) => session.send('Não entendi o que deseja'));

bot.dialog('/', intents);