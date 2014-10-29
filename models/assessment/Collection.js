/**
 * This MIGHT be one of the more confusing constructs in the app.
 *
 * We assume all assessments are assignments UNLESS they appear in the
 * non-assignment assessment object.  We also have a reference to all the
 * assignments that we can currently see.
 */
'use strict';

var merge = require('merge');

var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var objectEach = require('../../utils/object-each');

var Assignment = require('./Assignment');
//var Assessment = require('./Assignment');

function f(Cls, service, parent) {
	return function (v, k, o) {
		if (Array.isArray(v)) {
			o[k] = v.map(function(p){
				return Cls.parse(service, parent, p);
			});
		}
	};
}

/**
 * @class
 * Build the Assessment Collection.
 *
 * @param  {ServiceDocument} service     Service descriptor/interface.
 * @param  {Model} parent                Parent model.
 * @param  {Object} assignments          Object of keys where each key is an
 *                                       array of Assignments that are visible
 *                                       to the current user.
 * @param  {Object} assessments          Object of keys where each key is an
 *                                       array of Non-Assignment assessments
 *                                       visible to the current user.
 */
function Collection(service, parent, assignments, assessments, tables) {
	define(this,{
		_service: withValue(service),
		_parent: withValue(parent),
		_tables: withValue(tables)
	});


	this._visibleAssignments = objectEach(assignments, f(Assignment, service, this));
	//this._notAssignments = objectEach(assessments, f(Assessment, service, this));
}

merge(Collection.prototype, base, {

	getAssignments: function(outlineNodeID) {
		var node = this._tables.getNode(outlineNodeID);
		var v = this._visibleAssignments;
		return nodeToNTIIDs(node).reduce(function(agg, id) {
			if (v[id]) {
				agg = (agg || []).concat(v[id]);
			}
			return agg;
		}, null);
	},


	getAssignment: function(outlineNodeID, assignmentId) {
		var maybe = this.getAssignments(outlineNodeID);
		return maybe && maybe.reduce(function(found, assignment){
				return found || (assignment.is(assignmentId) && assignment);
			}, null);
	}
});



module.exports = Collection;


function nodeToNTIIDs(node) {
	var id = node.get('ntiid');
	return (id? [id] : []).concat(
			node.getchildren().reduce(function(a, b) {
				return a.concat(nodeToNTIIDs(b)); }, []));
}
