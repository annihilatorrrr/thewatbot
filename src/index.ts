import { Bot, InlineKeyboard } from "grammy";
import mongoose from "mongoose";

import {
  transform,
  fetchWords,
  createTemplate,
  createNewRecord,
} from "./util.js";
import { Db } from "./db.js";
import { BOT_TOKEN, MONGO_DB } from "./config.js";

const bot = new Bot(BOT_TOKEN);

const db = new Db(mongoose, MONGO_DB);

["help", "start"].forEach((command) =>
  bot.command(command, (ctx) =>
    ctx.reply(
      `An Inline English-to-English Dictionary Bot. \nTo use it, type <code>@thewatbot word</code> \nWritten by: @solooo7`,
      {
        parse_mode: "HTML",
        webpage_preview: false,
        reply_markup: new InlineKeyboard()
          .url("Source", "https://github.com/darvesh/thewatbot")
          .url("Buy me a coffee", "https://buymeacoffee.com/darvesh"),
      }
    )
  )
);

bot.inlineQuery(/^[\w\s]+$/, async (ctx) => {
  const userQuery = ctx.update.inline_query.query;
  if (!userQuery) return;
  console.count(userQuery);
  const words =
    (await db.findWords(userQuery)) ??
    (await createNewRecord(db, fetchWords, transform, userQuery));
  if (words?.length) return ctx.answerInlineQuery(createTemplate(words));
});

bot.catch(console.error);

bot.start({
  drop_pending_updates: true,
  onStart: () => console.log("Bot started"),
});
