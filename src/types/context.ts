import { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import { Context, SessionFlavor } from 'grammy'

export type SessionData = {
  question: string
  question_message_id: number
  selected_question_id: number
  menu_message_id: number
}
export type MyContext = Context &
  ConversationFlavor &
  SessionFlavor<SessionData>
export type MyConversation = Conversation<MyContext>
