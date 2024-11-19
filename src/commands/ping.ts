import EssentialsPlugin from "./essentials.js";

EssentialsPlugin.create()
    .then((plugin) => {
        plugin.addCommand({
            name: "/ping",
            description: "Ping the bot to check if it's alive or not",
            execute: async (args, message) => plugin.reply?.("Pong!"),
        });
    });