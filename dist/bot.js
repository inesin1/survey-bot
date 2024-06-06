"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBot = void 0;
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
const lodash_1 = __importDefault(require("lodash"));
const admin_1 = require("./menus/admin");
const useData_1 = require("./data/useData");
const useBot = (apiKey) => {
    // Data
    const bot = new grammy_1.Bot(apiKey);
    const answers = {};
    const { getWelcomeMessage, getAdminId, getByeMessage, getQuestion, addQuestion, editQuestion, editByeMessage, editWelcomeMessage } = (0, useData_1.useData)();
    bot.use((0, grammy_1.session)({
        initial: () => ({
            question: '',
            question_message_id: 0,
            selected_question_id: 0,
            menu_message_id: 0
        })
    }), (0, conversations_1.conversations)(), (0, conversations_1.createConversation)(askQuestions));
    const { adminMenu, questionsSettingsMenu } = (0, admin_1.useAdminMenu)(bot);
    bot.use(adminMenu, questionsSettingsMenu);
    // Methods
    const setupBot = (bot) => {
        bot.api.setMyCommands([
            {
                command: 'start',
                description: 'Начать работу'
            }
        ]);
    };
    const setupListeners = (bot) => {
        bot.command('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const startKeyboard = new grammy_1.Keyboard().text('Начнем!').resized().oneTime();
            yield ctx.reply(getWelcomeMessage(), { reply_markup: startKeyboard });
        }));
        bot.command('admin', (ctx) => {
            // if (ctx.from?.id !== getAdminId()) {
            //   ctx.reply('Вы не админ')
            //   return
            // }
            ctx.reply('Админ меню', { reply_markup: adminMenu });
        });
        bot.hears('Начнем!', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            answers['tg_username'] = (_b = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username) !== null && _b !== void 0 ? _b : 'Не известно';
            yield ctx.conversation.enter('askQuestions');
        }));
    };
    function askQuestions(conversation, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const isSuccess = yield askQuestion(0, conversation, ctx);
            if (isSuccess) {
                ctx.reply(getByeMessage());
                sendAnswers();
            }
        });
    }
    const askQuestion = (id, conversation, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const question = getQuestion(id);
        if (!question)
            return true;
        yield ctx.reply(question);
        const newCtx = yield conversation.wait();
        if (!((_a = newCtx.message) === null || _a === void 0 ? void 0 : _a.text))
            return false;
        if (['/admin', '/start'].includes(newCtx.message.text))
            return false;
        answers[question] = newCtx.message.text;
        yield askQuestion(id + 1, conversation, newCtx);
    });
    const sendAnswers = () => {
        const formattedAnswers = lodash_1.default.chain(answers)
            .toPairs()
            .map((a) => a.join(': '))
            .join('\n')
            .value();
        bot.api.sendMessage(getAdminId(), `Новый клиент! \n\n${formattedAnswers}`);
    };
    // Setup
    setupBot(bot);
    setupListeners(bot);
    bot.on(':text', (ctx) => {
        switch (ctx.session.question) {
            case 'new_question': {
                const { msgId, msg: { text } } = ctx;
                addQuestion(text);
                ctx.deleteMessages([
                    ctx.session.question_message_id,
                    ctx.session.menu_message_id,
                    msgId
                ]);
                ctx.reply(`Выберите вопрос`, { reply_markup: questionsSettingsMenu });
                break;
            }
            case 'edit_question': {
                const { msgId, msg: { text } } = ctx;
                editQuestion(ctx.session.selected_question_id, text);
                ctx.deleteMessages([
                    ctx.session.question_message_id,
                    ctx.session.menu_message_id,
                    msgId
                ]);
                ctx.reply(`Выберите вопрос`, { reply_markup: questionsSettingsMenu });
                break;
            }
            case 'edit_welcome': {
                const { msgId, msg: { text } } = ctx;
                editWelcomeMessage(text);
                ctx.deleteMessages([
                    ctx.session.question_message_id,
                    ctx.session.menu_message_id,
                    msgId
                ]);
                ctx.reply(`Админ меню`, { reply_markup: adminMenu });
                break;
            }
            case 'edit_end': {
                const { msgId, msg: { text } } = ctx;
                editByeMessage(text);
                ctx.deleteMessages([
                    ctx.session.question_message_id,
                    ctx.session.menu_message_id,
                    msgId
                ]);
                ctx.reply(`Админ меню`, { reply_markup: adminMenu });
                break;
            }
        }
        ctx.session.question = '';
    });
    bot.catch((err) => {
        console.log(err);
    });
    const start = () => bot.start();
    return {
        start
    };
};
exports.useBot = useBot;
