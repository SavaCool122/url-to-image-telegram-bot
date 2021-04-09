import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);
import { buffer } from "capture-website";
import pkg from "node-cron";
const { nodeCron: _schedule } = pkg;
import {
  SCHEDULER_CRON,
  DATE_TO_NAMES,
  PHOTO_OPTIONS,
  INFO_MSGS,
  PHOTO_SIZE,
} from "./constant.js";

let schedule = null

const main = ctx => {
  if (!schedule) schedule = _schedule(SCHEDULER_CRON, () => processPhoto(ctx));
  schedule.start();
  ctx.reply(INFO_MSGS.startScheduler);
};

const processPhoto = async ctx => {
  const file = await getPhoto(ctx);
  sendPhoto(ctx, file);
};

const getPhoto = async ctx => {
  const weekDay = getWeekDayForUrl();
  const url = `https://nkse.ru/html_pages/B_1_${weekDay}.htm`;
  const file = await buffer(url, PHOTO_SIZE);
  return file;
};

const getWeekDayForUrl = a => {
  const nowTime = new Date(Date.now());
  const weekDayIdx = nowTime.getDay();
  const timeHours = nowTime.getHours;
  if (timeHours >= 20) {
    const nextDay = weekDayIdx + 1;
    return DATE_TO_NAMES[nextDay];
  }
  return DATE_TO_NAMES[weekDayIdx];
};

const sendPhoto = async (ctx, file) => {
  ctx.reply(INFO_MSGS.progressingMsg);
  PHOTO_OPTIONS.source = file;
  ctx.telegram.sendPhoto(ctx.from.id, PHOTO_OPTIONS);
};

bot.command("/launchEveryDay", ctx => {
  ctx.reply(INFO_MSGS.startScheduler);
  if (!schedule) {
    schedule = _schedule(SCHEDULER_CRON, () => processPhoto(ctx));
    schedule.start();
  }
  schedule.start();
});

bot.command("/stopEveryDay", ctx => {
  ctx.reply(INFO_MSGS.stopSheduler);
  if (schedule) schedule.stop();
});

bot.command("/photoTomorrow", ctx => {
  processPhoto(ctx);
});

bot.command("/photoToday", ctx => {
  processPhoto(ctx);
});

bot.start(ctx => {
  ctx.reply("Welcome", {
    reply_markup: replyMarkup,
  });
  try {
    main(ctx);
  } catch (e) {
    ctx.reply(INFO_MSGS.errorMsg);
  }
});

bot.launch();
