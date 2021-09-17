/**
 * Libs
 */
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const fetch = require("node-fetch")
const fs = require('fs')
const CronJob = require('cron').CronJob
const figlet = require('figlet')
const moment = require('moment')
moment.locale('cs')
const musicController = require('./controllers/music')
const queue = new Map();

function sendMessageToChannel(channel) {
  client.channels.cache.forEach(ch => {
    if (ch.id === channel) {
      let fapstronaut = `<@&${process.env.DISCORD_ROLE}>`
      let msg1 = [
        'Vstávat a cvičit!',
        'Nový den nové dobrodružství.',
        'Držme se bratři, ať vydržíme dnešní zkoušky.',
        'Nepropadni pokušení! Nestaň se coomerem!',
        'Potěšení je chvilkové, sláva je věčná! Za slávou bratři!'
      ]

      let msg2 = [
        fapstronaut + ', hola hej otevřte mi dveře. Zbloudil jsem při lovení coomerů!',
        fapstronaut + ' úsvit nového dne. Víte, co máte dělat!',
        `*fanfára* **${fapstronaut}ům všech zemí, vydržte**`,
        `${fapstronaut}i ${fapstronaut}i ${fapstronaut}i Teď to nemůžeme vzdát! Jsme tak blízko.`,
        `!Breaking! ${fapstronaut} se stal synonymem slova frajer`
      ]

      let gifs = [
        'https://media.giphy.com/media/3o7btSHUTdraHEsx0Y/giphy.gif',
        'https://media.giphy.com/media/5xtDarIN81U0KvlnzKo/giphy.gif',
        'https://media.giphy.com/media/l0MYLhyyzhHQEhjck/giphy.gif',
        'https://media.giphy.com/media/6qFFgNgextP9u/giphy.gif',
        'https://media.giphy.com/media/5xtDarrD3UV3Qk6N00E/giphy.gif',
        'https://media.giphy.com/media/2sAitYulLo87u/giphy.gif',
        'https://media.giphy.com/media/kyQiCZuymIOvKavFxt/giphy.gif',
        'https://media.giphy.com/media/kHIJtQ981gP1C/giphy.gif'

      ]

      let day = figlet.textSync(`den ${new Date().getDate()}.`)
      let endMsg = '```\n' + day + '\n```\n' +
        msg1[Math.floor(Math.random() * msg1.length)] + '\n\n' +
        msg2[Math.floor(Math.random() * msg2.length)] + '\n\n' +
        'Denní prezenčka :white_check_mark: / ' +
        ':negative_squared_cross_mark: .\n\n' +
        '||Sláva vítězům, hanba poraženým...||\n\n\n'

      // Create a reaction collector
      // const filter = (reaction, user) => reaction.emoji.name === '❎'
      ch
        .send(endMsg)
        .then((message) => {
          message.react('✅')
          message.react('❎')
          message.pin()
          /* message.awaitReactions(filter, { time: 15000 }) // 86400
            .then(collected => {
              console.log(`Collected ${collected.size} reactions`)
              console.log(collected.message)
            })
            .catch(console.error) */
        })

      let filename
      const gifUrl = gifs[Math.floor(Math.random() * gifs.length)]
      if (gifUrl.includes('media.giphy.com')) {
        // Create folder for GIFs if not exist
        if (!fs.existsSync(`./${process.env.DIR_NAME}/giphy.com/`)) {
          fs.mkdirSync(`./${process.env.DIR_NAME}/giphy.com`)
        }
        filename = `./${process.env.DIR_NAME}/giphy.com/${gifUrl.split('/')[gifUrl.split('/').length - 2]}.gif`
      } else {
        const files = fs.readdirSync(process.env.DIR_NAME)
        filename = `./${process.env.DIR_NAME}/${files.length}.gif`
      }

      fetch(gifUrl)
        .then(res => {
          let dest = fs.createWriteStream(filename)
          res.body.pipe(dest)
          dest.on('close', () => {
            setTimeout(() => {
              ch.send(new Discord.MessageAttachment(fs.readFileSync(filename), 'funny.gif'))
              console.log('done')
            }, 2000)
          })
        })
    }
  })
}

client.once('ready', () => {
  console.log('Ready!')

  // Set bot activity
  client.user.setActivity(process.env.BOT_ACTIVITY_NAME, {
    type: process.env.BOT_ACTIVITY_OPTION_TYPE
  })
    .then(presence => {
      console.log(presence.activities[0].type + ' ' + presence.activities[0].name)
    })
    .catch(console.error)

  // Create folder for GIFs if not exist
  if (!fs.existsSync(process.env.DIR_NAME)) {
    fs.mkdirSync(process.env.DIR_NAME)
  }

  // Set cron job
  // new CronJob(process.env.CRON_JOB_TIMING, sendMessageToChannel(process.env.DISCORD_CHANNEL), null, true, process.env.UTC_LOCATION).start()
})


client.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const m = message.content.toLowerCase()
  const serverQueue = queue.get(message.guild.id);
  if (m === `${config.prefix}ping`) {
    message.channel.send('Pong.')
  } else if (m === `${config.prefix}help` || m === `${config.prefix}commands`) {
    message.channel.send(`${config.prefix}ping\n${config.prefix}server\n${config.prefix}help\n${config.prefix}commands`)
  } else if (m === `${config.prefix}server`) {
    message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`)
  } else if (message.content.startsWith(`${config.prefix}play`)) {
    musicController.execute(message, serverQueue)
  } else if (message.content.startsWith(`${config.prefix}skip`)) {
    musicController.skip(message, serverQueue)
  } else if (message.content.startsWith(`${config.prefix}stop`)) {
    musicController.stop(message, serverQueue)
  }
})

// Bot login
client.login(process.env.DISCORD_TOKEN)
