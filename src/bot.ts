import BotPlugin from "./botplugin.js";
import { WASocket } from "@whiskeysockets/baileys";

export default class Bot {
    private static instance: Bot;
    private static instanceListener: ((value: Bot | PromiseLike<Bot>) => void)[] = [];

    socket: WASocket;
    plugins: BotPlugin[] = [];

    private constructor(socket: WASocket) {
        this.socket = socket;

        socket.ev.on('messages.upsert', async (event) => {
            const message = event.messages[0];
            if(!message.message) return;
   
            const from = message.key.remoteJid;
            if(!from) {
                console.log("No from!");
                return;
            };
            const sender = message.key.participant;

            console.log(message);

            const args = message.message.extendedTextMessage?.text?.trim().split(' ') || message.message.ephemeralMessage?.message?.extendedTextMessage?.text?.trim().split(' ') || message.message.conversation?.trim().split(' ');
            if(!args) return;

            const commandName = args.shift()!.toLowerCase();

            for(const plugin of this.plugins) {
                let sent = await plugin.executeCommand(commandName, args, message, (res: string) => {
                    this.socket.sendMessage(from, { text: res }, { quoted: Object.assign(message, {
                        message: { conversation: `Processed by { plugin: ${plugin.name} }` }
                    }) });
                });
                if(sent) break;
            }
        });
    }

    public static create(socket: WASocket): Bot {
        let bot = new Bot(socket);
        Bot.instance = bot;
        Bot.instanceListener.forEach(listener => listener(bot));
        Bot.instanceListener = [];
        return bot;
    }

    public static getInstance(): Promise<Bot> {
        return new Promise((resolve, reject) => {
            if(Bot.instance) return resolve(Bot.instance);
            Bot.instanceListener.push(resolve);
        });
    }

    public enablePlugin(plugin: BotPlugin) {
        this.plugins.push(plugin);
        plugin.onEnable();
    }

    public disablePlugin(plugin: BotPlugin) {
        let index = this.plugins.indexOf(plugin);
        if(index === -1) return;
        this.plugins.splice(index, 1);
        plugin.onDisable();
    }
}