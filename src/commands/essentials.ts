import Bot from "../bot.js";
import BotPlugin from "../botplugin.js";

export default class EssentialsPlugin extends BotPlugin {
    private static instance: EssentialsPlugin;

    private constructor(bot: Bot) {
        super(bot, "essentials");
    }

    static create(): Promise<EssentialsPlugin> {
        return new Promise((resolve, reject) => {
            if(EssentialsPlugin.instance) return resolve(EssentialsPlugin.instance);

            Bot.getInstance()
                .then((bot) => {
                    let plugin = new EssentialsPlugin(bot);
                    bot.enablePlugin(plugin);
                    EssentialsPlugin.instance = plugin;
                    resolve(plugin);
                });
        });
    }

    public onEnable(): void {
        console.log("Essentials plugin enabled");
    }

    public onDisable(): void {
        console.log("Essentials plugin disabled");
    }
}
