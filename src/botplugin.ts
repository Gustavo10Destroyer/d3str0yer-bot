import Bot from "./bot.js";
import { WAMessage } from "@whiskeysockets/baileys";

interface ICommand {
    name: string;
    description: string;
    execute(...args: string[]): Promise<void>;
}

export default class BotPlugin {
    private bot: Bot;
    readonly name: string;
    commands: ICommand[] = [];

    reply?: (message: string) => void;

    constructor(bot: Bot, name: string) {
        this.bot = bot;
        this.name = name;
    }

    public static create(name: string): Promise<BotPlugin> {
        return new Promise((resolve, reject) => {
            Bot.getInstance()
                .then((bot) => {
                    let plugin = new BotPlugin(bot, name);
                    bot.enablePlugin(plugin);
                });
        });
    }

    public onEnable() {}
    public onDisable() {}

    public addCommand(command: ICommand) {
        this.commands.push(command);
    }

    public removeCommand(commandName: string) {
        let command = this.commands.find((command) => command.name === commandName);
        if(!command) return;
        this.commands.splice(this.commands.indexOf(command), 1);
    }

    public async executeCommand(commandName: string, args: string[], message: WAMessage, reply: (message: string) => void): Promise<boolean> {
        let command = this.commands.find((command) => command.name === commandName);
        if(!command) return false;
        let canReply = true;
        this.reply = (message: string) => {
            if(!canReply) return;
            reply(message);
        };
        await command.execute(...args);
        canReply = false;
        return true;
    }
}