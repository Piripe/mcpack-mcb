
export type UidTracker = {
    get: ()=> number;
};
export type VariableMap = {
    parent?: VariableMap2;
    variables: Map<string, any>;

    get:()=> Map<string, any>;

    fork:(variables?: Map<string, any>)=> VariableMap2;
};
export type VariableMap2 = {
    parent?: VariableMap;
    variables: Map<string, any>;

    get:()=>Map<string, any>;

    fork:(variables?: Map<string, any>)=> VariableMap;
};

export type PosInfo = {
    line: number;
    col: number;
    file: string;
};
export type McTemplate = {
    process:  (
        file: McFile,
        context: CompilerContext,
        pos: PosInfo,
        value: string,
        extras?: AstNode[]
    )  => void;
};

export type McFile = {
    name: string;
    existingDirectories: Map<string, boolean>;
    ast: AstNode[];
    templates: Map<string, McTemplate>;
    getTemplates:()=> Map<string, McTemplate>;
    setup:(compiler: Compiler)=>void;
    forkCompilerContextWithAppend(
        context: CompilerContext,
        append: (_: string) => void,
        functions: string[]
    ): CompilerContext;
    createAnonymousFunction(
        pos: PosInfo,
        body: AstNode[],
        data: string | null,
        context: CompilerContext,
        name?: string
    ): string;
    embed(
        context: CompilerContext,
        pos: PosInfo,
        varmap: Map<string, any>,
        body: AstNode[],
        useTld?: boolean
    );
    invokeExpressionInline:(expression: string, context: CompilerContext, pos: PosInfo)=> any;
    compile:(vars: VariableMap, compiler: Compiler)=>void;
};

export type AstNode = any;
export type CompileTimeIfElseExpressions = { condition: string | null; node: AstNode[] }[];
export type Token = any;

export type Compiler = {
    io: Io;
    baseDir: string;
    tags: TagManager;
    packNamespace: string;
    config: Config;
    addFile:(name: String, ast: Array<AstNode>)=> void;
    resolve:(baseFile: String, resolutionPath: String)=> ImportFileType;
    getInitialPathInfo:(p: string)=> {
        namespace: string;
        path: string[];
    };
    success: boolean;
    compile:(root: VariableMap)=> void;
};

export type Io = {
    write:(path: string, content: string)=> void;
    cleanup:()=> void;
    finished:()=> boolean;
}

export type TagManager = {
    tickFunctionEntries: Set<string>;
    loadFunctionEntries: Set<string>;

    addTickingCommand:(command: string)=> void;
    addLoadingCommand:(command: string)=> void;
    writeTagFiles:(compiler: Compiler)=> void;
};
export type Config = {
    debug: boolean;
    libDir: string;
    events: ConfigEvents;
    generatedDirName: string;
    internalId: string;
    internalScoreboardName: string;
    io: Io | null;
    header: string;
    enableHeaderParameters: boolean;
    ioThreadCount: number | null;
    create:(base: UserConfig)=> Config;
};

export type UserConfig = {
    debug: boolean | null;
    libDir: string | null;
    generatedDirName: string | null;
    internalId: string | null;
    internalScoreboardName: string | null;
    io: Io | null;
    header: string | null;
    enableHeaderParameters: boolean | null;
    ioThreadCount: number | null;
    setup: (_: Config) => void | null;
}
export type ConfigEvents = {
    onPreBuild: EventDispatcher<PreBuildEvent>;
    onPostBuild: EventDispatcher<PostBuildEvent>;
};
export type EventDispatcher<T> = {
    subscribe:(callback: (_: T) => void)=> void;
    dispatch:(event: T)=> void;
};
export type PreBuildEvent = {};
export type PostBuildEvent = { success: boolean };

export type ImportFileType = any;

export type BaseNameInfo = {
    namespace: string;
    path: string[];
};
export interface MCBContext {
    append: (_: string) => void;
    namespace: string;
    path: string[];
    uidIndex: UidTracker;
    variables: VariableMap;
    replacements: VariableMap;
    stack: PosInfo[];
    isTemplate: boolean;
    templates: Map<string, McTemplate>;
    requireTemplateKeyword: boolean;
    compiler: Compiler;
    globalVariables: VariableMap;
    functions: string[];
    currentFunction?: string[];
    baseNamespaceInfo: BaseNameInfo;
};
export type CompilerContext = MCBContext;

export const _:MCBContext|undefined=undefined;