/**
 * This MIGHT be one of the more confusing constructs in the app.
 *
 * We assume all assessments are assignments UNLESS they appear in the
 * non-assignment assessment object.  We also have a reference to all the
 * assignments that we can currently see.
 */
'use strict';


var base = require('../mixins/Base');

var define = require('../../utils/object-define-properties');
var withValue = require('../../utils/object-attribute-withvalue');
var objectEach = require('../../utils/object-each');

var parser = require('../../utils/parse-object');

function f(parent) {
	return function (v, k, o) {
		if (Array.isArray(v)) {
			o[k] = parser(parent, v);
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


	this._visibleAssignments = objectEach(assignments, f(this));
	this._notAssignments = objectEach(assessments, f(this));
}

Object.assign(Collection.prototype, base, {

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


	getAssessments: function(outlineNodeID) {
		var node = this._tables.getNode(outlineNodeID);
		var v = this._notAssignments;
		return nodeToNTIIDs(node).reduce(function(agg, id) {
			if (v[id]) {
				agg = (agg || []).concat(v[id]);
			}
			return agg;
		}, null);
	},


	isAssignment: function (outlineNodeID, assessmentId) {
		var maybe = this.getAssignment(outlineNodeID, assessmentId);
		if (maybe) {
			return null;
		}

		maybe = this.getAssessments(outlineNodeID, assessmentId);
		return !maybe || !find(maybe, assessmentId);
	},


	getAssignment: function(outlineNodeID, assignmentId) {
		var maybe = this.getAssignments(outlineNodeID);
		return maybe && find(maybe, assignmentId);
	}
});



module.exports = Collection;


function find(list, id) {
	return list.reduce(function(found, item){

		return found || (
			(item.getID()===id || (item.containsId && item.containsId(id))) ? item : null
		); }, null);
}


function nodeToNTIIDs(node) {
	var id = node.get('ntiid');
	return (id? [id] : []).concat(
			node.getchildren().reduce(function(a, b) {
				return a.concat(nodeToNTIIDs(b)); }, []));
}
