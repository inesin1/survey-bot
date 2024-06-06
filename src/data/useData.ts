import * as fs from 'fs'
import * as path from 'path'
import { Data } from '../types/data'
import _ from 'lodash'

export const useData = () => {
  const getData = () => {
    const rawData = fs.readFileSync(path.join(__dirname, './data.json'), 'utf8')
    return JSON.parse(rawData) as Data
  }
  const saveData = (data: Data) => {
    fs.writeFileSync(
      path.join(__dirname, './data.json'),
      JSON.stringify(data, null, 2)
    )
  }

  const getQuestions = () => getData().questions

  const getQuestion = (index: number) => {
    const questions = getData().questions
    if (index >= questions.length) return null
    return getData().questions[index]
  }

  const getQuestionsFormatted = () =>
    _.chain(getData().questions)
      .map((question, i) => `[${i}]: ${question}`)
      .join('\n')
      .value()

  const addQuestion = (question: string) => {
    const data = getData()
    data.questions.push(question)
    saveData(data)
  }

  const editQuestion = (index: number, text: string) => {
    const data = getData()
    data.questions[index] = text
    saveData(data)
  }

  const swapQuestions = (indexes: [number, number]) => {
    const data = getData()
    const questions = data.questions
    let temp = questions[indexes[0]]
    questions[indexes[0]] = questions[indexes[1]]
    questions[indexes[1]] = temp
    saveData(data)
  }

  const removeQuestion = (index: number) => {
    const data = getData()
    _.pull(data.questions, data.questions[index])
    saveData(data)
  }

  const getWelcomeMessage = () => getData().welcome_message
  const editWelcomeMessage = (text: string) => {
    const data = getData()
    data.welcome_message = text
    saveData(data)
  }

  const getByeMessage = () => getData().bye_message
  const editByeMessage = (text: string) => {
    const data = getData()
    data.bye_message = text
    saveData(data)
  }

  const getAdminId = () => getData().admin_id

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
  }
}
