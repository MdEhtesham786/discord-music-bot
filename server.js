const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const ytdl = require('ytdl-core');
const { createReadStream } = require('fs');
const { createAudioResource, demuxProbe, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// const { joinVoiceChannel, createAudioResource, demuxProbe, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
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

    const url = message.content.split(' ')[1];
    const stream = ytdl(url, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: demuxProbe(stream) });
    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });
});

client.login('YOUR_BOT_TOKEN');
