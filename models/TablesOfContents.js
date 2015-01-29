import Base from './Base';

export default class TablesOfContents extends Base{
	constructor (service, parent, tables) {
		super(service, parent);
		this.tables = tables;
	}

	getNode (id) {
		return this.tables.reduce((found, toc)=> found || toc.getNode(id), null);
	}

}
