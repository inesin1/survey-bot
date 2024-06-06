import { Bot } from 'grammy'
import { Menu, MenuRange } from '@grammyjs/menu'
import { MyContext } from '../types/context'
import _ from 'lodash'
import { useData } from '../data/useData'

export const useAdminMenu = (bot: Bot<MyContext>) => {
  const { getQuestions, removeQuestion } = useData()

  // const showQuestionList = (ctx: MyContext) => {
  //   ctx.editMessageText(
  //     `Выберите вопрос для редактирования: \n\n${getQuestionsFormatted()}`
  //   )
  // }

  const createNewQuestion = async (ctx: MyContext) => {
    const { message_id } = await ctx.reply('Введите вопрос')
    ctx.session.question = 'new_question'
    ctx.session.question_message_id = message_id
    ctx.session.menu_message_id = ctx.msgId!
  }

  const editQuestion = async (ctx: MyContext) => {
    const { message_id } = await ctx.reply('Введите вопрос')
    ctx.session.question = 'edit_question'
    ctx.session.question_message_id = message_id
    ctx.session.menu_message_id = ctx.msgId!
  }

  const editWelcome = async (ctx: MyContext) => {
    const { message_id } = await ctx.reply(
      'Введите новое приветственное сообщение'
    )
    ctx.session.question = 'edit_welcome'
    ctx.session.question_message_id = message_id
    ctx.session.menu_message_id = ctx.msgId!
  }

  const editEnd = async (ctx: MyContext) => {
    const { message_id } = await ctx.reply(
      'Введите новое завершающее сообщение'
    )
    ctx.session.question = 'edit_end'
    ctx.session.question_message_id = message_id
    ctx.session.menu_message_id = ctx.msgId!
  }

  // Админ меню
  const adminMenu = new Menu<MyContext>('admin-menu')
    .submenu(
      'Настройка вопросов',
      'questions-settings-menu',
      (ctx: MyContext) => {
        ctx.editMessageText('Выберите вопрос')
      }
    )
    .row()
    .text('Редактировать приветственное сообщение', (ctx) => {
      editWelcome(ctx)
    })
    .row()
    .text('Редактировать завершающее сообщение', (ctx) => {
      editEnd(ctx)
    })
    .row()
    .text('Закрыть', (ctx) => {
      ctx.deleteMessage()
    })

  // Меню настройки вопросов
  const questionsSettingsMenu = new Menu<MyContext>('questions-settings-menu')
    .dynamic(() => {
      const range = new MenuRange<MyContext>()
      const questions = getQuestions()

      questions.forEach((question, index) => {
        const questionText = `[${index}] ${question}`
        range
          .text(questionText, (ctx) => {
            ctx.session.selected_question_id = index
            ctx.menu.nav('question-edit-menu')
            ctx.editMessageText(questionText)
          })
          .row()
      })

      return range
    })
    .text('Новый вопрос', async (ctx: MyContext) => {
      createNewQuestion(ctx)
    })
    .row()
    .back('Назад', (ctx: MyContext) => {
      ctx.editMessageText('Админ меню')
    })

  const questionEditMenu = new Menu<MyContext>('question-edit-menu')
    .text('Редактировать', async (ctx: MyContext) => {
      editQuestion(ctx)
    })
    .row()
    .text('Удалить', async (ctx: MyContext) => {
      removeQuestion(ctx.session.selected_question_id)
      // @ts-ignore
      ctx.menu.nav('questions-settings-menu')
      ctx.editMessageText('Выберите вопрос')
    })
    .row()
    .back('Назад', (ctx: MyContext) => {
      ctx.editMessageText('Выберите вопрос')
    })

  adminMenu.register(questionsSettingsMenu)
  adminMenu.register(questionEditMenu, 'questions-settings-menu')

  return { adminMenu, questionsSettingsMenu }
}
