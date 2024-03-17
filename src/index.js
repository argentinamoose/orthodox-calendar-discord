import { Client, GatewayIntentBits, Message } from "discord.js";
import "dotenv/config";
import schedule from "node-schedule";
import fetch from "node-fetch";

let calendar = "new";
const prefix = "/";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("The bot is ready");
});

const job = schedule.scheduleJob("10 * * * * *", async function () {
  switch (calendar) {
    case "new": {
      const response = await fetch("https://orthocal.info/api/gregorian/");
      const data = await response.json();
      console.log(data);
      dailyMessage(data);
      break;
    }
    case "old": {
      const response = await fetch("https://orthocal.info/api/julian/");
      const data = await response.json();
      dailyMessage(data);
      break;
    }
    default:
      const channel = client.channels.cache.get(process.env.DEBUG); // For the testing channel
      channel.send(
        "*Error with calendar setup* https://tenor.com/view/dog-computer-gif-14860983"
      );
      break;
  }
});

async function dailyMessage(data) {
  const channel = client.channels.cache.get(process.env.DEBUG); // For the testing channel
  const currentDate = new Date();
  const date = `**Today is ${currentDate.toLocaleDateString()}, ${
    data.titles[0]
  }**`;
  const fast = `The fast is a ${data.fast_exception_desc}`;
  const readingsPre = `The readings are, [${data.readings[0].display}] and [${data.readings[1].display}]`;
  const readings = readingsPre.replace(/\./g, ":");
  const top = `${date}
    ${fast}
    ${readings};`;
  channel.send(top);
  channel.send("**The synaxarion for today is:**");
  switch (data.stories.length) {
    case 0:
      data.saints.forEach((e) => {
        channel.send(e);
      });
      break;
    default:
      data.stories.forEach((e) => {
        channel.send(e.title);
        const removePlus = e.story.replace(/' \+([^']+)\+'/, "");
        const breakUpStory = removePlus.split("\n");
        breakUpStory.forEach((element) => {
          const storiesWithoutTags = element.replace(/<\/?[^>]+(>|$)/g, "");
          console.log(storiesWithoutTags);
          channel.send("```" + storiesWithoutTags + "```");
        });
      });
      break;
  }
}

client.login(process.env.TOKEN);
