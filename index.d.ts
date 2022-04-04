import { Client, ClientOptions as protocolClientOptions, Server, ServerClient, ServerOptions as protocolServerOptions, PacketMeta } from 'minecraft-protocol';
import TypedEmitter from 'typed-emitter';
interface MinecraftLogin {
    username: string;
    password?: string;
    auth?: 'mojang' | 'microsoft';
}
interface ServerOptions {
    loginHandler: (client: Client) => MinecraftLogin;
    serverOptions?: protocolServerOptions;
    clientOptions?: Partial<protocolClientOptions>;
}
type ProxyEvents = {
    incoming: (data: any, meta: PacketMeta, toClient: ServerClient, toServer: Client) => void;
    outgoing: (data: any, meta: PacketMeta, toClient: ServerClient, toServer: Client) => void;
    start: (toClient: ServerClient, toServer: Client) => void;
    end: (username: string) => void;
}
declare const ProxyHandler_base: new () => TypedEmitter<ProxyEvents>;
declare class InstantConnectProxy extends ProxyHandler_base {
    options: ServerOptions;
    server?: Server;
    toServerClients: Map<number, Client>;
    constructor(options: ServerOptions);
    onLogin(toClient: ServerClient): void;
    clientEnd(client: ServerClient): void;
    clientIsOnline(client: ServerClient): boolean;
}

export { InstantConnectProxy }
