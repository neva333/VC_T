require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const WebSocket = require('ws');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'vtrans') {
        const targetChannel = client.channels.cache.get('1311365115282722848'); // VC3のチャンネルID

        if (targetChannel) {
            const connection = joinVoiceChannel({
                channelId: targetChannel.id,
                guildId: targetChannel.guild.id,
                adapterCreator: targetChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            connection.subscribe(player);

            const ws = new WebSocket('ws://localhost:8080');

            ws.on('message', message => {
                const resource = createAudioResource(Buffer.from(message), { inputType: StreamType.Opus });
                player.play(resource);
            });

            await interaction.reply({ content: 'VC3での音声再生を開始しました！', ephemeral: true });
        } else {
            await interaction.reply('指定されたチャンネルが見つかりません。');
        }
    } else if (commandName === 'qtrans') {
        const connection = getVoiceConnection('1311365115282722848');
        if (connection) connection.destroy();

        await interaction.reply({ content: '音声再生を停止しました！', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);