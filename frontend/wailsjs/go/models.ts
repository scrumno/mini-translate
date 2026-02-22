export namespace interfaces {
	
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

