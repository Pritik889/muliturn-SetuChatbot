const { ActivityHandler } = require("botbuilder");

class DialogBot extends ActivityHandler {
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('ConversationState is required')
        if (!userState) throw new Error('UserState is required')
        if (!dialog) throw new Error('Dialog is required')

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');
            //context.sendActivity(`You said"${context.activity.text}"`)
            await this.dialog.run(context, this.dialogState);
            await next();
        });
        this.onMembersAdded(async (context, next) => {
            await context.sendActivity('Please note that information from this chat will be used for monitoring &'
                + 'management of the current health crisis and research in the fight against COVID-19.');
            await next();
        })
    }
    async run(context) {
        await super.run(context);
        await this.conversationState.saveChanges(context, this);
        await this.userState.saveChanges(context, this);
    }
}
module.exports.DialogBot = DialogBot;