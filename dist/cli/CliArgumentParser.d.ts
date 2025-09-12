export interface CliArguments {
    prompt: string;
    imagePath: string;
    serverUrl: string;
}
export declare class CliArgumentParser {
    private readonly DEFAULT_SERVER_URL;
    parse(): CliArguments;
    private getArgValue;
    private displayHelp;
}
//# sourceMappingURL=CliArgumentParser.d.ts.map