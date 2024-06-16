import { Bot, Keyboard, session } from 'grammy'
import { createConversation, conversations } from '@grammyjs/conversations'
import { MyContext, MyConversation } from './types/context'
import _ from 'lodash'
import { useAdminMenu } from './menus/admin'
import { useData } from './data/useData'

export const useBot = (apiKey: string) => {
  // Data
  const bot = new Bot<MyContext>(apiKey)
  const answers: { [key: string]: string } = {}
  const {
    getWelcomeMessage,
    getAdminId,
    getByeMessage,
    getQuestion,
    addQuestion,
    editQuestion,
    editByeMessage,
    editWelcomeMessage
  } = useData()

  bot.use(
    session({
      initial: () => ({
        question: '',
        question_message_id: 0,
        selected_question_id: 0,
        menu_message_id: 0
      })
    }),
    conversations(),
    createConversation(askQuestions)
  )
  const { adminMenu, questionsSettingsMenu } = useAdminMenu(bot)
  bot.use(adminMenu, questionsSettingsMenu)

  // Methods
  const setupBot = (bot: Bot<MyContext>) => {
    bot.api.setMyCommands([
      {
        command: 'start',
        description: 'Начать работу'
      }
    ])
  }

  const setupListeners = (bot: Bot<MyContext>) => {
    bot.command('start', async (ctx: MyContext) => {
      const startKeyboard = new Keyboard().text('Начнем!').resized().oneTime()
      await ctx.reply(getWelcomeMessage(), { reply_markup: startKeyboard })
    })

    bot.command('admin', (ctx: MyContext) => {
      if (ctx.from?.id !== getAdminId()) {
        ctx.reply('Вы не админ')
        return
      }

      ctx.reply('Админ меню', { reply_markup: adminMenu })
    })

    bot.hears('Начнем!', async (ctx) => {
      answers['tg_username'] = ctx.from?.username ?? 'Не известно'
      await ctx.conversation.enter('askQuestions')
    })
  }

  async function askQuestions(conversation: MyConversation, ctx: MyContext) {
    const isSuccess = await askQuestion(0, conversation, ctx)
    console.log('Вышел', isSuccess)

    if (isSuccess) {
      ctx.reply(getByeMessage())
      sendAnswers()
    }
  }

  const askQuestion = async (
    id: number,
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<boolean> => {
    const question = getQuestion(id)

    if (!question) {
      console.log('no question')
      return true
    }

    await ctx.reply(question)

    const newCtx = await conversation.wait()
    if (!newCtx.message?.text) return false
    if (['/admin', '/start'].includes(newCtx.message.text)) return false

    answers[question] = newCtx.message!.text!

    return await askQuestion(id + 1, conversation, newCtx)
  }

  const sendAnswers = () => {
    const formattedAnswers = _.chain(answers)
      .toPairs()
      .map((a) => a.join(': '))
      .join('\n')
      .value()

    bot.api.sendMessage(getAdminId(), `Новый клиент! \n\n${formattedAnswers}`)
  }

  // Setup
  setupBot(bot)
  setupListeners(bot)

  bot.on(':text', (ctx) => {
    switch (ctx.session.question) {
      case 'new_question': {
        const {
          msgId,
          msg: { text }
        } = ctx
        addQuestion(text)

        ctx.deleteMessages([
          ctx.session.question_message_id,
          ctx.session.menu_message_id,
          msgId
        ])
        ctx.reply(`Выберите вопрос`, { reply_markup: questionsSettingsMenu })
        break
      }
      case 'edit_question': {
        const {
          msgId,
          msg: { text }
        } = ctx
        editQuestion(ctx.session.selected_question_id, text)

        ctx.deleteMessages([
          ctx.session.question_message_id,
          ctx.session.menu_message_id,
          msgId
        ])
        ctx.reply(`Выберите вопрос`, { reply_markup: questionsSettingsMenu })
        break
      }
      case 'edit_welcome': {
        const {
          msgId,
          msg: { text }
        } = ctx
        editWelcomeMessage(text)

        ctx.deleteMessages([
          ctx.session.question_message_id,
          ctx.session.menu_message_id,
          msgId
        ])
        ctx.reply(`Админ меню`, { reply_markup: adminMenu })
        break
      }
      case 'edit_end': {
        const {
          msgId,
          msg: { text }
        } = ctx
        editByeMessage(text)

        ctx.deleteMessages([
          ctx.session.question_message_id,
          ctx.session.menu_message_id,
          msgId
        ])
        ctx.reply(`Админ меню`, { reply_markup: adminMenu })
        break
      }
    }
    ctx.session.question = ''
  })

  bot.catch((err) => {
    console.log(err)
  })

  const start = () => bot.start()

  return {
    start
  }
}
