export namespace interfaces {
	
	export class ConfigDTO {
	    translatorDebug: boolean;
	    viteDebug: boolean;
	    ankiConnectUrl: string;
	    ankiDeckWords: string;
	    ankiDeckPhrases: string;
	    ankiNoteTypeWords: string;
	    ankiNoteTypePhrases: string;
	    obsidianVaultPath: string;
	    hotkey: string;
	
	    static createFrom(source: any = {}) {
	        return new ConfigDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.translatorDebug = source["translatorDebug"];
	        this.viteDebug = source["viteDebug"];
	        this.ankiConnectUrl = source["ankiConnectUrl"];
	        this.ankiDeckWords = source["ankiDeckWords"];
	        this.ankiDeckPhrases = source["ankiDeckPhrases"];
	        this.ankiNoteTypeWords = source["ankiNoteTypeWords"];
	        this.ankiNoteTypePhrases = source["ankiNoteTypePhrases"];
	        this.obsidianVaultPath = source["obsidianVaultPath"];
	        this.hotkey = source["hotkey"];
	    }
	}
	export class DictionaryEntryDTO {
	    word: string;
	    transcription: string;
	    partOfSpeech: string;
	    definitions: string[];
	    examples: string[];
	
	    static createFrom(source: any = {}) {
	        return new DictionaryEntryDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.word = source["word"];
	        this.transcription = source["transcription"];
	        this.partOfSpeech = source["partOfSpeech"];
	        this.definitions = source["definitions"];
	        this.examples = source["examples"];
	    }
	}
	export class LanguageDTO {
	    code: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new LanguageDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.name = source["name"];
	    }
	}
	export class SaveToAnkiRequestDTO {
	    source: string;
	    result: string;
	    fromLang: string;
	    toLang: string;
	    isPhrase: boolean;
	    transcription?: string;
	    partOfSpeech?: string;
	    exampleEN?: string;
	    exampleRU?: string;
	    context?: string;
	    tags?: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveToAnkiRequestDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.source = source["source"];
	        this.result = source["result"];
	        this.fromLang = source["fromLang"];
	        this.toLang = source["toLang"];
	        this.isPhrase = source["isPhrase"];
	        this.transcription = source["transcription"];
	        this.partOfSpeech = source["partOfSpeech"];
	        this.exampleEN = source["exampleEN"];
	        this.exampleRU = source["exampleRU"];
	        this.context = source["context"];
	        this.tags = source["tags"];
	    }
	}
	export class SaveToAnkiResponseDTO {
	    noteId: number;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveToAnkiResponseDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.noteId = source["noteId"];
	        this.error = source["error"];
	    }
	}
	export class SaveToObsidianRequestDTO {
	    source: string;
	    result: string;
	    fromLang: string;
	    toLang: string;
	    isPhrase: boolean;
	    transcription?: string;
	    partOfSpeech?: string;
	    exampleEN?: string;
	    exampleRU?: string;
	    context?: string;
	    tags?: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveToObsidianRequestDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.source = source["source"];
	        this.result = source["result"];
	        this.fromLang = source["fromLang"];
	        this.toLang = source["toLang"];
	        this.isPhrase = source["isPhrase"];
	        this.transcription = source["transcription"];
	        this.partOfSpeech = source["partOfSpeech"];
	        this.exampleEN = source["exampleEN"];
	        this.exampleRU = source["exampleRU"];
	        this.context = source["context"];
	        this.tags = source["tags"];
	    }
	}
	export class SaveToObsidianResponseDTO {
	    path?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveToObsidianResponseDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.error = source["error"];
	    }
	}
	export class TranslateRequestDTO {
	    text: string;
	    fromLang: string;
	    toLang: string;
	
	    static createFrom(source: any = {}) {
	        return new TranslateRequestDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.fromLang = source["fromLang"];
	        this.toLang = source["toLang"];
	    }
	}
	export class TranslationDTO {
	    id: string;
	    source: string;
	    result: string;
	    fromLang: string;
	    toLang: string;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new TranslationDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.source = source["source"];
	        this.result = source["result"];
	        this.fromLang = source["fromLang"];
	        this.toLang = source["toLang"];
	        this.createdAt = source["createdAt"];
	    }
	}

}

