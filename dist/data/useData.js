"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useData = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const useData = () => {
    const getData = () => {
        const rawData = fs.readFileSync(path.join(__dirname, './data.json'), 'utf8');
        return JSON.parse(rawData);
    };
    const saveData = (data) => {
        fs.writeFileSync(path.join(__dirname, './data.json'), JSON.stringify(data, null, 2));
    };
    const getQuestions = () => getData().questions;
    const getQuestion = (index) => {
        const questions = getData().questions;
        if (index >= questions.length)
            return null;
        return getData().questions[index];
    };
    const getQuestionsFormatted = () => lodash_1.default.chain(getData().questions)
        .map((question, i) => `[${i}]: ${question}`)
        .join('\n')
        .value();
    const addQuestion = (question) => {
        const data = getData();
        data.questions.push(question);
        saveData(data);
    };
    const editQuestion = (index, text) => {
        const data = getData();
        data.questions[index] = text;
        saveData(data);
    };
    const swapQuestions = (indexes) => {
        const data = getData();
        const questions = data.questions;
        let temp = questions[indexes[0]];
        questions[indexes[0]] = questions[indexes[1]];
        questions[indexes[1]] = temp;
        saveData(data);
    };
    const removeQuestion = (index) => {
        const data = getData();
        lodash_1.default.pull(data.questions, data.questions[index]);
        saveData(data);
    };
    const getWelcomeMessage = () => getData().welcome_message;
    const editWelcomeMessage = (text) => {
        const data = getData();
        data.welcome_message = text;
        saveData(data);
    };
    const getByeMessage = () => getData().bye_message;
    const editByeMessage = (text) => {
        const data = getData();
        data.bye_message = text;
        saveData(data);
    };
    const getAdminId = () => getData().admin_id;
    return {
        getQuestions,
        getQuestion,
        getQuestionsFormatted,
        addQuestion,
        editQuestion,
        swapQuestions,
        removeQuestion,
        getWelcomeMessage,
        getByeMessage,
        getAdminId,
        editByeMessage,
        editWelcomeMessage
    };
};
exports.useData = useData;
