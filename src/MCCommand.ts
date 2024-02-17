import { NamespacedID } from "./Namespace.ts";
import { Duration } from "./dataTypes.ts";
import { MCBContext } from "./mcbContext.ts";
import { stringFromTemplateParams } from "./utils.ts";

export interface BuildContext {
    mcfunctions: MCFunction[];
}

export abstract class MCCommand {
    abstract buildCommand(context: BuildContext): string;

    static contextual(builder: (context: BuildContext) => string): MCCommand {
        return new ContextualCommand(builder);
    }

    static pure(command: string): MCCommand {
        return new LiteralCommand(command);
    }
}
MCCommand.prototype.toString = function () {
    return this.buildCommand({} as BuildContext);
};
class LiteralCommand extends MCCommand {
    constructor(
        /**@type {string} */
        public command: string
    ) {
        super();
    }
    buildCommand() {
        return this.command;
    }
}
class ContextualCommand extends MCCommand {
    constructor(
        /**@type {(context: BuildContext)=>string} */
        public builder: (context: BuildContext) => string
    ) {
        super();
    }
    buildCommand(context: BuildContext) {
        return this.builder(context);
    }
}

/**
 * Tagged template literal for commands. Automatically de-dents and removes new lines
 * @example
 * command`say hello world`
 */
export function command(strings: TemplateStringsArray, ...values: any[]) {
    return MCCommand.pure(stringFromTemplateParams(strings, ...values).replaceAll(/\n\s+/g, ""));
}

export class MCFunction {
    /**@type {string} */
    label = "";
    /**@type {string|undefined} */
    functionCall?: string;
    constructor(
        /**@type {NamespacedID|undefined} */
        public namespacedID?: NamespacedID,
        /**@type {MCCommand[]|undefined} */
        public commands: MCCommand[] = [],
        /**@type {MCBContext|undefined} */
        public context?: MCBContext
    ) {}

    run() {
        if (this.context) {
            if (!this.namespacedID)
                this.namespacedID = new NamespacedID(
                    this.context.namespace,
                    `${this.context.compiler.config.generatedDirName}/${this.context.uidIndex
                        .get()
                        .toString()}`
                );
            this.context.compiler.io.write(
                `data/${this.namespacedID.namespace}/functions/${this.namespacedID.id}.mcfunction`,
                this.commands.join("\n")
            );
            return MCCommand.pure(`function ${this.namespacedID}`);
        }
        return MCCommand.contextual(context => {
            context.mcfunctions.push(this);
            return `function ${this.namespacedID}`;
        });
    }

    static run(namespacedID: NamespacedID) {
        return MCCommand.pure(`function ${namespacedID}`);
    }
}

export function mcfunction(commands: (this: MCFunction) => Iterable<MCCommand>, context?: MCBContext) {
    const fun = new MCFunction(undefined, undefined, context);
    fun.commands = Array.from(commands.call(fun));
    if (!fun.label) fun.label = commands.name;
    return fun;
}

export const scheduler = new (class MCScheduler {
    append(delay: Duration, fun: MCFunction) {
        return MCCommand.contextual(context => {
            context.mcfunctions.push(fun);
            return `schedule function ${fun.namespacedID} ${delay} append`;
        });
    }

    replace(delay: Duration, fun: MCFunction) {
        return MCCommand.contextual(context => {
            context.mcfunctions.push(fun);
            return `schedule function ${fun.namespacedID} ${delay} replace`;
        });
    }
})();
