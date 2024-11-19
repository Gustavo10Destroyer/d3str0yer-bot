import path from "path";
import Bot from "./bot.js";
import Loader from "./loader.js";

import { 
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";


let attempts = 0; // Reconnection attempt counter
const maxAttempts = 3; // Maximum number of reconnection attempts

async function main() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();
    
    const socket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });
    socket.logger.level = "fatal";

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', (event) => {
        const {
            qr,
            connection,
            lastDisconnect
        } = event;

        if(qr) {
            console.log(qr);
        }

        if(connection === "close") {
            const reason = lastDisconnect?.error?.message;
            console.log(`[INFO] Connection closed due to ${reason}.`);

            attempts++;
            let shouldReconnect = (attempts < maxAttempts);
            console.log(`[INFO] Reconnection attempt: ${attempts}/${maxAttempts}`);
            if(!shouldReconnect) {
                console.log(`[INFO] Maximum reconnection attempts reached. Exiting...`);
                console.log("[TIP] Check your network connection.");
                console.log("[TIP] You can delete the auth_info folder to start a new session.");
                return;
            }
            main();
            return;
        }

        if(connection === "open") {
            attempts = 0;
            console.log("Connected!");
        }
    });

    Bot.create(socket);
    Loader.loadPlugins(path.join(__dirname, "commands"));
}

main();