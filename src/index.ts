import * as dotenv from 'dotenv'
import { useBot } from './bot'

dotenv.config()

const apiKey = process.env['BOT_API_KEY']
if (!apiKey) {
  throw Error('Необходимо ввести API ключ бота в .env')
}

const { start } = useBot(apiKey)
start()
