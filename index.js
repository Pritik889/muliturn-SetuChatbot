const restify = require('restify');
const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { DialogBot } = require('./bots/dialogbot');
const { UserProfileDialog } = require('./dialogs/userProfileDialog');

const adapter=new BotFrameworkAdapter();

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const dialog = new UserProfileDialog(userState);
const bot = new DialogBot(conversationState, userState, dialog);

const server = restify.createServer();
server.listen(3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

server.post('/api/dialogbot', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});