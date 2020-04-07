const { MessageFactory, CardFactory } = require('botbuilder');
const {
    DialogSet,
    ChoicePrompt,
    NumberPrompt,
    WaterfallDialog,
    ChoiceFactory,
    ComponentDialog,
    DialogTurnStatus,
    TextPrompt,
    ListStyle

} = require('botbuilder-dialogs');


const NAME_PROMPT = 'NAME_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const SYMPTOMS_CHOICE_PROMPT = 'SYMPTOMS_CHOICE_PROMPT';
const SYMPTOMS2_CHOICE_PROMPT = 'SYMPTOMS2_CHOICE_PROMPT';
const TRAVEL_CHOICE_PROMPT = 'TRAVEL_CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEMP_CHOICE_PROMPT = 'TEMP_CHOICE_PROMPT';

class UserProfileDialog extends ComponentDialog {
    constructor(userState) {
        super('UserProfileDialog');
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new ChoicePrompt(SYMPTOMS_CHOICE_PROMPT));
        this.addDialog(new ChoicePrompt(SYMPTOMS2_CHOICE_PROMPT));
        this.addDialog(new ChoicePrompt(TRAVEL_CHOICE_PROMPT));
        this.addDialog(new ChoicePrompt(TEMP_CHOICE_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.nameStep.bind(this),
            this.genderStep.bind(this),
            this.temperatureStep.bind(this),
            this.ageStep.bind(this),
            this.symptomStep.bind(this),
            this.symptomStep2.bind(this),
            this.travelStep.bind(this),
            this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    async nameStep(step) {
        return await step.prompt(NAME_PROMPT, 'Please type your name.')
    }
    async genderStep(step) {
        step.values.name = step.result;
        console.log(step.result);
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'What is your gender?',
            choices: ChoiceFactory.toChoices(['Male', 'Female', 'Other']),
            style: ListStyle.button
        });
    }
    async temperatureStep(step) {
        step.values.gender = step.result.value;
        console.log(step.result.value);

        return await step.prompt(TEMP_CHOICE_PROMPT,
            'Please let us know your current body temperature in degree Fahrenheit (Normal body temperature is 98.6°F):',
            this.getChoicesTemp()
        );
    }
    getChoicesTemp() {
        const cardOptions = [
            {
                value: 'Normal (96°F-98.6°F)',
                synonyms: ['normal']
            },
            {
                value: 'Fever (98.6°F-102°F)',
                synonyms: ['fever']
            },
            {
                value: 'High Fever (>102°F)',
                synonyms: ['hfever']
            },
            {
                value: 'Don’t know',
                synonyms: ['dtk']
            }
        ];

        return cardOptions;
    }
    async ageStep(step) {
        console.log('age step called')
        console.log(step.result.value);
        step.values.temperature = step.result.value;

        return await step.prompt(NUMBER_PROMPT, 'Please type your age.')
    }
    async symptomStep(step) {
        console.log('symptoms step called')
        step.values.age = step.result;
        console.log(step.values.age);
        const choices = ['Diabetes', 'Hypertension', 'LungDisease', 'None of these'];
        return await step.prompt(TEMP_CHOICE_PROMPT,
            'Are you experiencing any of the following symptoms?',
            choices
        );
    }
    getChoicessymptom() {
        const cardOptions = [
            {
                value: 'Dry Cough',
                synonyms: ['dry']
            },
            {
                value: 'Sore Throat',
                synonyms: ['sore']
            },
            {
                value: 'Weakness',
                synonyms: ['weak']
            },
            {
                value: 'Loss or diminished sense of smell',
                synonyms: ['loss']
            },
            {
                value: 'Change in Appetite',
                synonyms: ['change']
            }
        ];

        return cardOptions;
    }
    async symptomStep2(step) {
        console.log('symptoms2 step called')
        step.values.symptom = step.result.value;
        const choices = ['Diabetes', 'Hypertension', 'LungDisease', 'None of these'];
        return await step.prompt(SYMPTOMS_CHOICE_PROMPT,
            'Have you ever had any of the following?',
            choices
        );
    }
    getChoicessymptom2() {
        const cardOptions = [
            {
                value: 'Moderate to Severe Cough',
                synonyms: ['caugh']
            },
            {
                value: 'Feeling Breathless',
                synonyms: ['br']
            },
            {
                value: ' Difficulty in Breathing',
                synonyms: ['dif']
            },
            {
                value: ' Drowsiness',
                synonyms: ['dr']
            },
            {
                value: ' Persistant Pain and Pressure in Chest',
                synonyms: ['pr']
            }
        ];

        return cardOptions;
    }
    async travelStep(step) {
        console.log('symptoms2 step called')
        step.values.symptoms = step.result.value;
        const choices = ['Yes', 'No'];
        return await step.prompt(TRAVEL_CHOICE_PROMPT,
            'Have you traveled anywhere internationally in the last 14 days?',
            choices
        );
    }
    async summaryStep(step) {
        console.log('summary step called')
        console.log(step.values.age);
        step.values.travel = step.result.value;
        const card = CardFactory.adaptiveCard({
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Personal Details:-",
                    "horizontalAlignment": "Left",
                    "size": "Medium",
                    "weight": "Bolder"
                },
                {
                    "type": "FactSet",
                    "facts": [
                        {
                            "title": "Name:",
                            "value": step.values.name
                        },
                        {
                            "title": "Gender: ",
                            "value": step.values.gender
                        }
                    ]
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
        }
        );
        const message = 'Hey ' + step.values.name + ' infection risk is low.We recommend that you stay at home to avoid any chance of exposure to the Novel'
            + 'Coronavirus';

        await step.context.sendActivity(message);
        await step.context.sendActivity({ attachments: [card] });
        return await step.endDialog();
    }

}
module.exports.UserProfileDialog = UserProfileDialog