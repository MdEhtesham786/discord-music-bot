const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
// const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core-discord');
// const ytSearch = require('yt-search');
const { createReadStream } = require('fs');
const { createAudioResource, demuxProbe, createAudioPlayer, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// const { joinVoiceChannel, createAudioResource, demuxProbe,  , AudioPlayerStatus } = require('@discordjs/voice');
client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!play')) return;

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply('You need to be in a voice channel to play music!');
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    //////////////////////////////////////////////////

    const command = message.content.toLowerCase();

    if (command.startsWith('!play')) {
        const songName = message.content.substring('!play'.length).trim();

        try {
            const result = await ytsr(songName);
            // console.log(result.items[0]);
            if (!result.items || !result.items.length) {
                return message.reply('No videos found for the given search query.');
            }

            const video = result.items[0];

            // const streamPromise = ytdl(video.url, { filter: 'audioonly' });
            // const stream = await ytdl(video.url, { filter: 'audioonly' });
            const stream = await ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
            console.log(stream);

            // Wait for the streamPromise to resolve
            // const stream = await streamPromise;
            // Now create the audio resource
            const resource = createAudioResource(stream, { inputType: demuxProbe(stream) });
            const player = createAudioPlayer();

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            message.reply(`Now playing: ${video.title}`);


            run();

        } catch (error) {
            console.error(error);
            message.reply('Error: Unable to play the requested song.');
        }
    } else if (command === '!stop') {
        connection.destroy();
        message.reply('Playback stopped.');
    } else if (command === '!replay') {
        // Handle replay logic here (create a new audio player and subscribe)
        // ...
    }

});


client.login(process.env.BOT_TOKEN);
console.log(process.env.BOT_TOKEN);
