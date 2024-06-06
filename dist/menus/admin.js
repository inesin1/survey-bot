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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAdminMenu = void 0;
const menu_1 = require("@grammyjs/menu");
const useData_1 = require("../data/useData");
const useAdminMenu = (bot) => {
    const { getQuestions, removeQuestion } = (0, useData_1.useData)();
    // const showQuestionList = (ctx: MyContext) => {
    //   ctx.editMessageText(
    //     `Выберите вопрос для редактирования: \n\n${getQuestionsFormatted()}`
    //   )
    // }
    const createNewQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { message_id } = yield ctx.reply('Введите вопрос');
        ctx.session.question = 'new_question';
        ctx.session.question_message_id = message_id;
        ctx.session.menu_message_id = ctx.msgId;
    });
    const editQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { message_id } = yield ctx.reply('Введите вопрос');
        ctx.session.question = 'edit_question';
        ctx.session.question_message_id = message_id;
        ctx.session.menu_message_id = ctx.msgId;
    });
    const editWelcome = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { message_id } = yield ctx.reply('Введите новое приветственное сообщение');
        ctx.session.question = 'edit_welcome';
        ctx.session.question_message_id = message_id;
        ctx.session.menu_message_id = ctx.msgId;
    });
    const editEnd = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { message_id } = yield ctx.reply('Введите новое завершающее сообщение');
        ctx.session.question = 'edit_end';
        ctx.session.question_message_id = message_id;
        ctx.session.menu_message_id = ctx.msgId;
    });
    // Админ меню
    const adminMenu = new menu_1.Menu('admin-menu')
        .submenu('Настройка вопросов', 'questions-settings-menu', (ctx) => {
        ctx.editMessageText('Выберите вопрос');
    })
        .row()
        .text('Редактировать приветственное сообщение', (ctx) => {
        editWelcome(ctx);
    })
        .row()
        .text('Редактировать завершающее сообщение', (ctx) => {
        editEnd(ctx);
    })
        .row()
        .text('Закрыть', (ctx) => {
        ctx.deleteMessage();
    });
    // Меню настройки вопросов
    const questionsSettingsMenu = new menu_1.Menu('questions-settings-menu')
        .dynamic(() => {
        const range = new menu_1.MenuRange();
        const questions = getQuestions();
        questions.forEach((question, index) => {
            const questionText = `[${index}] ${question}`;
            range
                .text(questionText, (ctx) => {
                ctx.session.selected_question_id = index;
                ctx.menu.nav('question-edit-menu');
                ctx.editMessageText(questionText);
            })
                .row();
        });
        return range;
    })
        .text('Новый вопрос', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        createNewQuestion(ctx);
    }))
        .row()
        .back('Назад', (ctx) => {
        ctx.editMessageText('Админ меню');
    });
    const questionEditMenu = new menu_1.Menu('question-edit-menu')
        .text('Редактировать', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        editQuestion(ctx);
    }))
        .row()
        .text('Удалить', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        removeQuestion(ctx.session.selected_question_id);
        // @ts-ignore
        ctx.menu.nav('questions-settings-menu');
        ctx.editMessageText('Выберите вопрос');
    }))
        .row()
        .back('Назад', (ctx) => {
        ctx.editMessageText('Выберите вопрос');
    });
    adminMenu.register(questionsSettingsMenu);
    adminMenu.register(questionEditMenu, 'questions-settings-menu');
    return { adminMenu, questionsSettingsMenu };
};
exports.useAdminMenu = useAdminMenu;
