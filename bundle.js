(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = Object.create(null);

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      var handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = Object.create(null);
        return subject;
      }

      if (registeredEvents[eventName]) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }

      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}],2:[function(require,module,exports){
/**
 * @fileOverview Contains definition of the core graph object.
 */

// TODO: need to change storage layer:
// 1. Be able to get all nodes O(1)
// 2. Be able to get number of links O(1)

/**
 * @example
 *  var graph = require('ngraph.graph')();
 *  graph.addNode(1);     // graph has one node.
 *  graph.addLink(2, 3);  // now graph contains three nodes and one link.
 *
 */
module.exports = createGraph;

var eventify = require('ngraph.events');

/**
 * Creates a new graph
 */
function createGraph(options) {
  // Graph structure is maintained as dictionary of nodes
  // and array of links. Each node has 'links' property which
  // hold all links related to that node. And general links
  // array is used to speed up all links enumeration. This is inefficient
  // in terms of memory, but simplifies coding.
  options = options || {};
  if ('uniqueLinkId' in options) {
    console.warn(
      'ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\n' +
      'Use `multigraph` option instead\n',
      '\n',
      'Note: there is also change in default behavior: From now own each graph\n'+
      'is considered to be not a multigraph by default (each edge is unique).'
    );

    options.multigraph = options.uniqueLinkId;
  }

  // Dear reader, the non-multigraphs do not guarantee that there is only
  // one link for a given pair of node. When this option is set to false
  // we can save some memory and CPU (18% faster for non-multigraph);
  if (options.multigraph === undefined) options.multigraph = false;

  var nodes = typeof Object.create === 'function' ? Object.create(null) : {},
    links = [],
    // Hash of multi-edges. Used to track ids of edges between same nodes
    multiEdges = {},
    nodesCount = 0,
    suspendEvents = 0,

    forEachNode = createNodeIterator(),
    createLink = options.multigraph ? createUniqueLink : createSingleLink,

    // Our graph API provides means to listen to graph changes. Users can subscribe
    // to be notified about changes in the graph by using `on` method. However
    // in some cases they don't use it. To avoid unnecessary memory consumption
    // we will not record graph changes until we have at least one subscriber.
    // Code below supports this optimization.
    //
    // Accumulates all changes made during graph updates.
    // Each change element contains:
    //  changeType - one of the strings: 'add', 'remove' or 'update';
    //  node - if change is related to node this property is set to changed graph's node;
    //  link - if change is related to link this property is set to changed graph's link;
    changes = [],
    recordLinkChange = noop,
    recordNodeChange = noop,
    enterModification = noop,
    exitModification = noop;

  // this is our public API:
  var graphPart = {
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode: addNode,

    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink: addLink,

    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: removeLink,

    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode: removeNode,

    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode: getNode,

    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodesCount: function () {
      return nodesCount;
    },

    /**
     * Gets total number of links in the graph.
     */
    getLinksCount: function () {
      return links.length;
    },

    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Array of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: getLinks,

    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode: forEachNode,

    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode: forEachLinkedNode,

    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink: forEachLink,

    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: enterModification,

    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: exitModification,

    /**
     * Removes all nodes and links from the graph.
     */
    clear: clear,

    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonim for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: getLink,

    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonim for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: getNode,

    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one. null otherwise.
     */
    getLink: getLink
  };

  // this will add `on()` and `fire()` methods.
  eventify(graphPart);

  monitorSubscribers();

  return graphPart;

  function monitorSubscribers() {
    var realOn = graphPart.on;

    // replace real `on` with our temporary on, which will trigger change
    // modification monitoring:
    graphPart.on = on;

    function on() {
      // now it's time to start tracking stuff:
      graphPart.beginUpdate = enterModification = enterModificationReal;
      graphPart.endUpdate = exitModification = exitModificationReal;
      recordLinkChange = recordLinkChangeReal;
      recordNodeChange = recordNodeChangeReal;

      // this will replace current `on` method with real pub/sub from `eventify`.
      graphPart.on = realOn;
      // delegate to real `on` handler:
      return realOn.apply(graphPart, arguments);
    }
  }

  function recordLinkChangeReal(link, changeType) {
    changes.push({
      link: link,
      changeType: changeType
    });
  }

  function recordNodeChangeReal(node, changeType) {
    changes.push({
      node: node,
      changeType: changeType
    });
  }

  function addNode(nodeId, data) {
    if (nodeId === undefined) {
      throw new Error('Invalid node identifier');
    }

    enterModification();

    var node = getNode(nodeId);
    if (!node) {
      node = new Node(nodeId, data);
      nodesCount++;
      recordNodeChange(node, 'add');
    } else {
      node.data = data;
      recordNodeChange(node, 'update');
    }

    nodes[nodeId] = node;

    exitModification();
    return node;
  }

  function getNode(nodeId) {
    return nodes[nodeId];
  }

  function removeNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) {
      return false;
    }

    enterModification();

    var prevLinks = node.links;
    if (prevLinks) {
      node.links = null;
      for(var i = 0; i < prevLinks.length; ++i) {
        removeLink(prevLinks[i]);
      }
    }

    delete nodes[nodeId];
    nodesCount--;

    recordNodeChange(node, 'remove');

    exitModification();

    return true;
  }


  function addLink(fromId, toId, data) {
    enterModification();

    var fromNode = getNode(fromId) || addNode(fromId);
    var toNode = getNode(toId) || addNode(toId);

    var link = createLink(fromId, toId, data);

    links.push(link);

    // TODO: this is not cool. On large graphs potentially would consume more memory.
    addLinkToNode(fromNode, link);
    if (fromId !== toId) {
      // make sure we are not duplicating links for self-loops
      addLinkToNode(toNode, link);
    }

    recordLinkChange(link, 'add');

    exitModification();

    return link;
  }

  function createSingleLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    return new Link(fromId, toId, data, linkId);
  }

  function createUniqueLink(fromId, toId, data) {
    // TODO: Get rid of this method.
    var linkId = makeLinkId(fromId, toId);
    var isMultiEdge = multiEdges.hasOwnProperty(linkId);
    if (isMultiEdge || getLink(fromId, toId)) {
      if (!isMultiEdge) {
        multiEdges[linkId] = 0;
      }
      var suffix = '@' + (++multiEdges[linkId]);
      linkId = makeLinkId(fromId + suffix, toId + suffix);
    }

    return new Link(fromId, toId, data, linkId);
  }

  function getLinks(nodeId) {
    var node = getNode(nodeId);
    return node ? node.links : null;
  }

  function removeLink(link) {
    if (!link) {
      return false;
    }
    var idx = indexOfElementInArray(link, links);
    if (idx < 0) {
      return false;
    }

    enterModification();

    links.splice(idx, 1);

    var fromNode = getNode(link.fromId);
    var toNode = getNode(link.toId);

    if (fromNode) {
      idx = indexOfElementInArray(link, fromNode.links);
      if (idx >= 0) {
        fromNode.links.splice(idx, 1);
      }
    }

    if (toNode) {
      idx = indexOfElementInArray(link, toNode.links);
      if (idx >= 0) {
        toNode.links.splice(idx, 1);
      }
    }

    recordLinkChange(link, 'remove');

    exitModification();

    return true;
  }

  function getLink(fromNodeId, toNodeId) {
    // TODO: Use sorted links to speed this up
    var node = getNode(fromNodeId),
      i;
    if (!node || !node.links) {
      return null;
    }

    for (i = 0; i < node.links.length; ++i) {
      var link = node.links[i];
      if (link.fromId === fromNodeId && link.toId === toNodeId) {
        return link;
      }
    }

    return null; // no link.
  }

  function clear() {
    enterModification();
    forEachNode(function(node) {
      removeNode(node.id);
    });
    exitModification();
  }

  function forEachLink(callback) {
    var i, length;
    if (typeof callback === 'function') {
      for (i = 0, length = links.length; i < length; ++i) {
        callback(links[i]);
      }
    }
  }

  function forEachLinkedNode(nodeId, callback, oriented) {
    var node = getNode(nodeId);

    if (node && node.links && typeof callback === 'function') {
      if (oriented) {
        return forEachOrientedLink(node.links, nodeId, callback);
      } else {
        return forEachNonOrientedLink(node.links, nodeId, callback);
      }
    }
  }

  function forEachNonOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      var linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;

      quitFast = callback(nodes[linkedNodeId], link);
      if (quitFast) {
        return true; // Client does not need more iterations. Break now.
      }
    }
  }

  function forEachOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      if (link.fromId === nodeId) {
        quitFast = callback(nodes[link.toId], link);
        if (quitFast) {
          return true; // Client does not need more iterations. Break now.
        }
      }
    }
  }

  // we will not fire anything until users of this library explicitly call `on()`
  // method.
  function noop() {}

  // Enter, Exit modification allows bulk graph updates without firing events.
  function enterModificationReal() {
    suspendEvents += 1;
  }

  function exitModificationReal() {
    suspendEvents -= 1;
    if (suspendEvents === 0 && changes.length > 0) {
      graphPart.fire('changed', changes);
      changes.length = 0;
    }
  }

  function createNodeIterator() {
    // Object.keys iterator is 1.3x faster than `for in` loop.
    // See `https://github.com/anvaka/ngraph.graph/tree/bench-for-in-vs-obj-keys`
    // branch for perf test
    return Object.keys ? objectKeysIterator : forInIterator;
  }

  function objectKeysIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    var keys = Object.keys(nodes);
    for (var i = 0; i < keys.length; ++i) {
      if (callback(nodes[keys[i]])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }

  function forInIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }
    var node;

    for (node in nodes) {
      if (callback(nodes[node])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }
}

// need this for old browsers. Should this be a separate module?
function indexOfElementInArray(element, array) {
  if (!array) return -1;

  if (array.indexOf) {
    return array.indexOf(element);
  }

  var len = array.length,
    i;

  for (i = 0; i < len; i += 1) {
    if (array[i] === element) {
      return i;
    }
  }

  return -1;
}

/**
 * Internal structure to represent node;
 */
function Node(id, data) {
  this.id = id;
  this.links = null;
  this.data = data;
}

function addLinkToNode(node, link) {
  if (node.links) {
    node.links.push(link);
  } else {
    node.links = [link];
  }
}

/**
 * Internal structure to represent links;
 */
function Link(fromId, toId, data, id) {
  this.fromId = fromId;
  this.toId = toId;
  this.data = data;
  this.id = id;
}

function hashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function makeLinkId(fromId, toId) {
  return fromId.toString() + '👉 ' + toId.toString();
}

},{"ngraph.events":1}],3:[function(require,module,exports){
/**
 * Based on https://github.com/mourner/tinyqueue
 * Copyright (c) 2017, Vladimir Agafonkin https://github.com/mourner/tinyqueue/blob/master/LICENSE
 * 
 * Adapted for PathFinding needs by @anvaka
 * Copyright (c) 2017, Andrei Kashcha
 */
module.exports = NodeHeap;

function NodeHeap(data, options) {
  if (!(this instanceof NodeHeap)) return new NodeHeap(data, options);

  if (!Array.isArray(data)) {
    // assume first argument is our config object;
    options = data;
    data = [];
  }

  options = options || {};

  this.data = data || [];
  this.length = this.data.length;
  this.compare = options.compare || defaultCompare;
  this.setNodeId = options.setNodeId || noop;

  if (this.length > 0) {
    for (var i = (this.length >> 1); i >= 0; i--) this._down(i);
  }

  if (options.setNodeId) {
    for (var i = 0; i < this.length; ++i) {
      this.setNodeId(this.data[i], i);
    }
  }
}

function noop() {}

function defaultCompare(a, b) {
  return a - b;
}

NodeHeap.prototype = {

  push: function (item) {
    this.data.push(item);
    this.setNodeId(item, this.length);
    this.length++;
    this._up(this.length - 1);
  },

  pop: function () {
    if (this.length === 0) return undefined;

    var top = this.data[0];
    this.length--;

    if (this.length > 0) {
      this.data[0] = this.data[this.length];
      this.setNodeId(this.data[0], 0);
      this._down(0);
    }
    this.data.pop();

    return top;
  },

  peek: function () {
    return this.data[0];
  },

  updateItem: function (pos) {
    this._down(pos);
    this._up(pos);
  },

  _up: function (pos) {
    var data = this.data;
    var compare = this.compare;
    var setNodeId = this.setNodeId;
    var item = data[pos];

    while (pos > 0) {
      var parent = (pos - 1) >> 1;
      var current = data[parent];
      if (compare(item, current) >= 0) break;
        data[pos] = current;

       setNodeId(current, pos);
       pos = parent;
    }

    data[pos] = item;
    setNodeId(item, pos);
  },

  _down: function (pos) {
    var data = this.data;
    var compare = this.compare;
    var halfLength = this.length >> 1;
    var item = data[pos];
    var setNodeId = this.setNodeId;

    while (pos < halfLength) {
      var left = (pos << 1) + 1;
      var right = left + 1;
      var best = data[left];

      if (right < this.length && compare(data[right], best) < 0) {
        left = right;
        best = data[right];
      }
      if (compare(best, item) >= 0) break;

      data[pos] = best;
      setNodeId(best, pos);
      pos = left;
    }

    data[pos] = item;
    setNodeId(item, pos);
  }
};
},{}],4:[function(require,module,exports){
/**
 * Performs suboptimal, greed A Star path finding.
 * This finder does not necessary finds the shortest path. The path
 * that it finds is very close to the shortest one. It is very fast though.
 */
module.exports = aStarBi;

var NodeHeap = require('./NodeHeap');
var makeSearchStatePool = require('./makeSearchStatePool');
var heuristics = require('./heuristics');
var defaultSettings = require('./defaultSettings');

var BY_FROM = 1;
var BY_TO = 2;
var NO_PATH = defaultSettings.NO_PATH;

module.exports.l2 = heuristics.l2;
module.exports.l1 = heuristics.l1;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`, it may be extended in future.
 * 
 * NOTE: Algorithm implemented in this code DOES NOT find optimal path.
 * Yet the path that it finds is always near optimal, and it finds it very fast.
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * 
 * @param {Object} options that configures search
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`.  Defaults function returns 0, which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
function aStarBi(graph, options) {
  options = options || {};
  // whether traversal should be considered over oriented graph.
  var oriented = options.oriented;

  var heuristic = options.heuristic;
  if (!heuristic) heuristic = defaultSettings.heuristic;

  var distance = options.distance;
  if (!distance) distance = defaultSettings.distance;
  var pool = makeSearchStatePool();

  return {
    find: find
  };

  function find(fromId, toId) {
    // Not sure if we should return NO_PATH or throw. Throw seem to be more
    // helpful to debug errors. So, throwing.
    var from = graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    var to = graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);

    if (from === to) return [from]; // trivial case.

    pool.reset();

    var callVisitor = oriented ? orientedVisitor : nonOrientedVisitor;

    // Maps nodeId to NodeSearchState.
    var nodeState = new Map();

    var openSetFrom = new NodeHeap({
      compare: defaultSettings.compareFScore,
      setNodeId: defaultSettings.setHeapIndex
    });

    var openSetTo = new NodeHeap({
      compare: defaultSettings.compareFScore,
      setNodeId: defaultSettings.setHeapIndex
    });


    var startNode = pool.createNewState(from);
    nodeState.set(fromId, startNode);

    // For the first node, fScore is completely heuristic.
    startNode.fScore = heuristic(from, to);
    // The cost of going from start to start is zero.
    startNode.distanceToSource = 0;
    openSetFrom.push(startNode);
    startNode.open = BY_FROM;

    var endNode = pool.createNewState(to);
    endNode.fScore = heuristic(to, from);
    endNode.distanceToSource = 0;
    openSetTo.push(endNode);
    endNode.open = BY_TO;

    // Cost of the best solution found so far. Used for accurate termination
    var lMin = Number.POSITIVE_INFINITY;
    var minFrom;
    var minTo;

    var currentSet = openSetFrom;
    var currentOpener = BY_FROM;

    while (openSetFrom.length > 0 && openSetTo.length > 0) {
      if (openSetFrom.length < openSetTo.length) {
        // we pick a set with less elements
        currentOpener = BY_FROM;
        currentSet = openSetFrom;
      } else {
        currentOpener = BY_TO;
        currentSet = openSetTo;
      }

      var current = currentSet.pop();

      // no need to visit this node anymore
      current.closed = true;

      if (current.distanceToSource > lMin) continue;

      graph.forEachLinkedNode(current.node.id, callVisitor);

      if (minFrom && minTo) {
        // This is not necessary the best path, but we are so greedy that we
        // can't resist:
        return reconstructBiDirectionalPath(minFrom, minTo);
      }
    }

    return NO_PATH; // No path.

    function nonOrientedVisitor(otherNode, link) {
      return visitNode(otherNode, link, current);
    }

    function orientedVisitor(otherNode, link) {
      // For oritned graphs we need to reverse graph, when traveling
      // backwards. So, we use non-oriented ngraph's traversal, and 
      // filter link orientation here.
      if (currentOpener === BY_FROM) {
        if (link.fromId === current.node.id) return visitNode(otherNode, link, current)
      } else if (currentOpener === BY_TO) {
        if (link.toId === current.node.id) return visitNode(otherNode, link, current);
      }
    }

    function canExit(currentNode) {
      var opener = currentNode.open
      if (opener && opener !== currentOpener) {
        return true;
      }

      return false;
    }

    function reconstructBiDirectionalPath(a, b) {
      var pathOfNodes = [];
      var aParent = a;
      while(aParent) {
        pathOfNodes.push(aParent.node);
        aParent = aParent.parent;
      }
      var bParent = b;
      while (bParent) {
        pathOfNodes.unshift(bParent.node);
        bParent = bParent.parent
      }
      return pathOfNodes;
    }

    function visitNode(otherNode, link, cameFrom) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) {
        // Already processed this node.
        return;
      }

      if (canExit(otherSearchState, cameFrom)) {
        // this node was opened by alternative opener. The sets intersect now,
        // we found an optimal path, that goes through *this* node. However, there
        // is no guarantee that this is the global optimal solution path.

        var potentialLMin = otherSearchState.distanceToSource + cameFrom.distanceToSource;
        if (potentialLMin < lMin) {
          minFrom = otherSearchState;
          minTo = cameFrom
          lMin = potentialLMin;
        }
        // we are done with this node.
        return;
      }

      var tentativeDistance = cameFrom.distanceToSource + distance(otherSearchState.node, cameFrom.node, link);

      if (tentativeDistance >= otherSearchState.distanceToSource) {
        // This would only make our path longer. Ignore this route.
        return;
      }

      // Choose target based on current working set:
      var target = (currentOpener === BY_FROM) ? to : from;
      var newFScore = tentativeDistance + heuristic(otherSearchState.node, target);
      if (newFScore >= lMin) {
        // this can't be optimal path, as we have already found a shorter path.
        return;
      }
      otherSearchState.fScore = newFScore;

      if (otherSearchState.open === 0) {
        // Remember this node in the current set
        currentSet.push(otherSearchState);
        currentSet.updateItem(otherSearchState.heapIndex);

        otherSearchState.open = currentOpener;
      }

      // bingo! we found shorter path:
      otherSearchState.parent = cameFrom;
      otherSearchState.distanceToSource = tentativeDistance;
    }
  }
}

},{"./NodeHeap":3,"./defaultSettings":6,"./heuristics":7,"./makeSearchStatePool":8}],5:[function(require,module,exports){
/**
 * Performs a uni-directional A Star search on graph.
 * 
 * We will try to minimize f(n) = g(n) + h(n), where
 * g(n) is actual distance from source node to `n`, and
 * h(n) is heuristic distance from `n` to target node.
 */
module.exports = aStarPathSearch;

var NodeHeap = require('./NodeHeap');
var makeSearchStatePool = require('./makeSearchStatePool');
var heuristics = require('./heuristics');
var defaultSettings = require('./defaultSettings.js');

var NO_PATH = defaultSettings.NO_PATH;

module.exports.l2 = heuristics.l2;
module.exports.l1 = heuristics.l1;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`, it may be extended in future.
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * @param {Object} options that configures search
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`. This function should never overestimate actual distance between two
 * nodes (otherwise the found path will not be the shortest). Defaults function returns 0,
 * which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
function aStarPathSearch(graph, options) {
  options = options || {};
  // whether traversal should be considered over oriented graph.
  var oriented = options.oriented;

  var heuristic = options.heuristic;
  if (!heuristic) heuristic = defaultSettings.heuristic;

  var distance = options.distance;
  if (!distance) distance = defaultSettings.distance;
  var pool = makeSearchStatePool();

  return {
    /**
     * Finds a path between node `fromId` and `toId`.
     * @returns {Array} of nodes between `toId` and `fromId`. Empty array is returned
     * if no path is found.
     */
    find: find
  };

  function find(fromId, toId) {
    var from = graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    var to = graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);
    pool.reset();

    // Maps nodeId to NodeSearchState.
    var nodeState = new Map();

    // the nodes that we still need to evaluate
    var openSet = new NodeHeap({
      compare: defaultSettings.compareFScore,
      setNodeId: defaultSettings.setHeapIndex
    });

    var startNode = pool.createNewState(from);
    nodeState.set(fromId, startNode);

    // For the first node, fScore is completely heuristic.
    startNode.fScore = heuristic(from, to);

    // The cost of going from start to start is zero.
    startNode.distanceToSource = 0;
    openSet.push(startNode);
    startNode.open = 1;

    var cameFrom;

    while (openSet.length > 0) {
      cameFrom = openSet.pop();
      if (goalReached(cameFrom, to)) return reconstructPath(cameFrom);

      // no need to visit this node anymore
      cameFrom.closed = true;
      graph.forEachLinkedNode(cameFrom.node.id, visitNeighbour, oriented);
    }

    // If we got here, then there is no path.
    return NO_PATH;

    function visitNeighbour(otherNode, link) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) {
        // Already processed this node.
        return;
      }
      if (otherSearchState.open === 0) {
        // Remember this node.
        openSet.push(otherSearchState);
        otherSearchState.open = 1;
      }

      var tentativeDistance = cameFrom.distanceToSource + distance(otherNode, cameFrom.node, link);
      if (tentativeDistance >= otherSearchState.distanceToSource) {
        // This would only make our path longer. Ignore this route.
        return;
      }

      // bingo! we found shorter path:
      otherSearchState.parent = cameFrom;
      otherSearchState.distanceToSource = tentativeDistance;
      otherSearchState.fScore = tentativeDistance + heuristic(otherSearchState.node, to);

      openSet.updateItem(otherSearchState.heapIndex);
    }
  }
}

function goalReached(searchState, targetNode) {
  return searchState.node === targetNode;
}

function reconstructPath(searchState) {
  var path = [searchState.node];
  var parent = searchState.parent;

  while (parent) {
    path.push(parent.node);
    parent = parent.parent;
  }

  return path;
}

},{"./NodeHeap":3,"./defaultSettings.js":6,"./heuristics":7,"./makeSearchStatePool":8}],6:[function(require,module,exports){
// We reuse instance of array, but we trie to freeze it as well,
// so that consumers don't modify it. Maybe it's a bad idea.
var NO_PATH = [];
if (typeof Object.freeze === 'function') Object.freeze(NO_PATH);

module.exports = {
  // Path search settings
  heuristic: blindHeuristic,
  distance: constantDistance,
  compareFScore: compareFScore,
  NO_PATH: NO_PATH,

  // heap settings
  setHeapIndex: setHeapIndex,

  // nba:
  setH1: setH1,
  setH2: setH2,
  compareF1Score: compareF1Score,
  compareF2Score: compareF2Score,
}

function blindHeuristic(/* a, b */) {
  // blind heuristic makes this search equal to plain Dijkstra path search.
  return 0;
}

function constantDistance(/* a, b */) {
  return 1;
}

function compareFScore(a, b) {
  var result = a.fScore - b.fScore;
  // TODO: Can I improve speed with smarter ties-breaking?
  // I tried distanceToSource, but it didn't seem to have much effect
  return result;
}

function setHeapIndex(nodeSearchState, heapIndex) {
  nodeSearchState.heapIndex = heapIndex;
}

function compareF1Score(a, b) {
  return a.f1 - b.f1;
}

function compareF2Score(a, b) {
  return a.f2 - b.f2;
}

function setH1(node, heapIndex) {
  node.h1 = heapIndex;
}

function setH2(node, heapIndex) {
  node.h2 = heapIndex;
}
},{}],7:[function(require,module,exports){
module.exports = {
  l2: l2,
  l1: l1
};

/**
 * Euclid distance (l2 norm);
 * 
 * @param {*} a 
 * @param {*} b 
 */
function l2(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Manhattan distance (l1 norm);
 * @param {*} a 
 * @param {*} b 
 */
function l1(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.abs(dx) + Math.abs(dy);
}

},{}],8:[function(require,module,exports){
/**
 * This class represents a single search node in the exploration tree for
 * A* algorithm.
 * 
 * @param {Object} node  original node in the graph
 */
function NodeSearchState(node) {
  this.node = node;

  // How we came to this node?
  this.parent = null;

  this.closed = false;
  this.open = 0;

  this.distanceToSource = Number.POSITIVE_INFINITY;
  // the f(n) = g(n) + h(n) value
  this.fScore = Number.POSITIVE_INFINITY;

  // used to reconstruct heap when fScore is updated.
  this.heapIndex = -1;
};

function makeSearchStatePool() {
  var currentInCache = 0;
  var nodeCache = [];

  return {
    createNewState: createNewState,
    reset: reset
  };

  function reset() {
    currentInCache = 0;
  }

  function createNewState(node) {
    var cached = nodeCache[currentInCache];
    if (cached) {
      // TODO: This almost duplicates constructor code. Not sure if
      // it would impact performance if I move this code into a function
      cached.node = node;
      // How we came to this node?
      cached.parent = null;

      cached.closed = false;
      cached.open = 0;

      cached.distanceToSource = Number.POSITIVE_INFINITY;
      // the f(n) = g(n) + h(n) value
      cached.fScore = Number.POSITIVE_INFINITY;

      // used to reconstruct heap when fScore is updated.
      cached.heapIndex = -1;

    } else {
      cached = new NodeSearchState(node);
      nodeCache[currentInCache] = cached;
    }
    currentInCache++;
    return cached;
  }
}
module.exports = makeSearchStatePool;
},{}],9:[function(require,module,exports){
module.exports = nba;

var NodeHeap = require('../NodeHeap');
var heuristics = require('../heuristics');
var defaultSettings = require('../defaultSettings.js');
var makeNBASearchStatePool = require('./makeNBASearchStatePool.js');

var NO_PATH = defaultSettings.NO_PATH;

module.exports.l2 = heuristics.l2;
module.exports.l1 = heuristics.l1;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`.
 * 
 * This is implementation of the NBA* algorithm described in 
 * 
 *  "Yet another bidirectional algorithm for shortest paths" paper by Wim Pijls and Henk Post
 * 
 * The paper is available here: https://repub.eur.nl/pub/16100/ei2009-10.pdf
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * @param {Object} options that configures search
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`. This function should never overestimate actual distance between two
 * nodes (otherwise the found path will not be the shortest). Defaults function returns 0,
 * which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
function nba(graph, options) {
  options = options || {};
  // whether traversal should be considered over oriented graph.
  var oriented = options.oriented;
  var quitFast = options.quitFast;

  var heuristic = options.heuristic;
  if (!heuristic) heuristic = defaultSettings.heuristic;

  var distance = options.distance;
  if (!distance) distance = defaultSettings.distance;

  // During stress tests I noticed that garbage collection was one of the heaviest
  // contributors to the algorithm's speed. So I'm using an object pool to recycle nodes.
  var pool = makeNBASearchStatePool();

  return {
    /**
     * Finds a path between node `fromId` and `toId`.
     * @returns {Array} of nodes between `toId` and `fromId`. Empty array is returned
     * if no path is found.
     */
    find: find
  };

  function find(fromId, toId) {
    // I must apologize for the code duplication. This was the easiest way for me to
    // implement the algorithm fast.
    var from = graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    var to = graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);

    pool.reset();

    // I must also apologize for somewhat cryptic names. The NBA* is bi-directional
    // search algorithm, which means it runs two searches in parallel. One runs
    // from source node to target, while the other one runs from target to source.
    // Everywhere where you see `1` it means it's for the forward search. `2` is for 
    // backward search.

    // For oriented graph path finding, we need to reverse the graph, so that
    // backward search visits correct link. Obviously we don't want to duplicate
    // the graph, instead we always traverse the graph as non-oriented, and filter
    // edges in `visitN1Oriented/visitN2Oritented`
    var forwardVisitor = oriented ? visitN1Oriented : visitN1;
    var reverseVisitor = oriented ? visitN2Oriented : visitN2;

    // Maps nodeId to NBASearchState.
    var nodeState = new Map();

    // These two heaps store nodes by their underestimated values.
    var open1Set = new NodeHeap({
      compare: defaultSettings.compareF1Score,
      setNodeId: defaultSettings.setH1
    });
    var open2Set = new NodeHeap({
      compare: defaultSettings.compareF2Score,
      setNodeId: defaultSettings.setH2
    });

    // This is where both searches will meet.
    var minNode;

    // The smallest path length seen so far is stored here:
    var lMin = Number.POSITIVE_INFINITY;

    // We start by putting start/end nodes to the corresponding heaps
    var startNode = pool.createNewState(from);
    nodeState.set(fromId, startNode); 
    startNode.g1 = 0;
    var f1 = heuristic(from, to);
    startNode.f1 = f1;
    open1Set.push(startNode);

    var endNode = pool.createNewState(to);
    nodeState.set(toId, endNode);
    endNode.g2 = 0;
    var f2 = f1; // they should agree originally
    endNode.f2 = f2;
    open2Set.push(endNode)

    // the `cameFrom` variable is accessed by both searches, so that we can store parents.
    var cameFrom;

    // this is the main algorithm loop:
    while (open2Set.length && open1Set.length) {
      if (open1Set.length < open2Set.length) {
        forwardSearch();
      } else {
        reverseSearch();
      }

      if (quitFast && minNode) break;
    }

    // If we got here, then there is no path.
    var path = reconstructPath(minNode);
    return path; // the public API is over

    function forwardSearch() {
      cameFrom = open1Set.pop();
      if (cameFrom.closed) {
        return;
      }

      cameFrom.closed = true;

      if (cameFrom.f1 < lMin && (cameFrom.g1 + f2 - heuristic(from, cameFrom.node)) < lMin) {
        graph.forEachLinkedNode(cameFrom.node.id, forwardVisitor);
      }

      if (open1Set.length > 0) {
        f1 = open1Set.peek().f1;
      } 
    }

    function reverseSearch() {
      cameFrom = open2Set.pop();
      if (cameFrom.closed) {
        return;
      }
      cameFrom.closed = true;

      if (cameFrom.f2 < lMin && (cameFrom.g2 + f1 - heuristic(cameFrom.node, to)) < lMin) {
        graph.forEachLinkedNode(cameFrom.node.id, reverseVisitor);
      }

      if (open2Set.length > 0) {
        f2 = open2Set.peek().f2;
      }
    }

    function visitN1(otherNode, link) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) return;

      var tentativeDistance = cameFrom.g1 + distance(cameFrom.node, otherNode, link);

      if (tentativeDistance < otherSearchState.g1) {
        otherSearchState.g1 = tentativeDistance;
        otherSearchState.f1 = tentativeDistance + heuristic(otherSearchState.node, to);
        otherSearchState.p1 = cameFrom;
        if (otherSearchState.h1 < 0) {
          open1Set.push(otherSearchState);
        } else {
          open1Set.updateItem(otherSearchState.h1);
        }
      }
      var potentialMin = otherSearchState.g1 + otherSearchState.g2;
      if (potentialMin < lMin) { 
        lMin = potentialMin;
        minNode = otherSearchState;
      }
    }

    function visitN2(otherNode, link) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) return;

      var tentativeDistance = cameFrom.g2 + distance(cameFrom.node, otherNode, link);

      if (tentativeDistance < otherSearchState.g2) {
        otherSearchState.g2 = tentativeDistance;
        otherSearchState.f2 = tentativeDistance + heuristic(from, otherSearchState.node);
        otherSearchState.p2 = cameFrom;
        if (otherSearchState.h2 < 0) {
          open2Set.push(otherSearchState);
        } else {
          open2Set.updateItem(otherSearchState.h2);
        }
      }
      var potentialMin = otherSearchState.g1 + otherSearchState.g2;
      if (potentialMin < lMin) {
        lMin = potentialMin;
        minNode = otherSearchState;
      }
    }

    function visitN2Oriented(otherNode, link) {
      // we are going backwards, graph needs to be reversed. 
      if (link.toId === cameFrom.node.id) return visitN2(otherNode, link);
    }
    function visitN1Oriented(otherNode, link) {
      // this is forward direction, so we should be coming FROM:
      if (link.fromId === cameFrom.node.id) return visitN1(otherNode, link);
    }
  }
}

function reconstructPath(searchState) {
  if (!searchState) return NO_PATH;

  var path = [searchState.node];
  var parent = searchState.p1;

  while (parent) {
    path.push(parent.node);
    parent = parent.p1;
  }

  var child = searchState.p2;

  while (child) {
    path.unshift(child.node);
    child = child.p2;
  }
  return path;
}

},{"../NodeHeap":3,"../defaultSettings.js":6,"../heuristics":7,"./makeNBASearchStatePool.js":10}],10:[function(require,module,exports){
module.exports = makeNBASearchStatePool;

/**
 * Creates new instance of NBASearchState. The instance stores information
 * about search state, and is used by NBA* algorithm.
 *
 * @param {Object} node - original graph node
 */
function NBASearchState(node) {
  /**
   * Original graph node.
   */
  this.node = node;

  /**
   * Parent of this node in forward search
   */
  this.p1 = null;

  /**
   * Parent of this node in reverse search
   */
  this.p2 = null;

  /**
   * If this is set to true, then the node was already processed
   * and we should not touch it anymore.
   */
  this.closed = false;

  /**
   * Actual distance from this node to its parent in forward search
   */
  this.g1 = Number.POSITIVE_INFINITY;

  /**
   * Actual distance from this node to its parent in reverse search
   */
  this.g2 = Number.POSITIVE_INFINITY;


  /**
   * Underestimated distance from this node to the path-finding source.
   */
  this.f1 = Number.POSITIVE_INFINITY;

  /**
   * Underestimated distance from this node to the path-finding target.
   */
  this.f2 = Number.POSITIVE_INFINITY;

  // used to reconstruct heap when fScore is updated. TODO: do I need them both?

  /**
   * Index of this node in the forward heap.
   */
  this.h1 = -1;

  /**
   * Index of this node in the reverse heap.
   */
  this.h2 = -1;
}

/**
 * As path-finding is memory-intensive process, we want to reduce pressure on
 * garbage collector. This class helps us to recycle path-finding nodes and significantly
 * reduces the search time (~20% faster than without it).
 */
function makeNBASearchStatePool() {
  var currentInCache = 0;
  var nodeCache = [];

  return {
    /**
     * Creates a new NBASearchState instance
     */
    createNewState: createNewState,

    /**
     * Marks all created instances available for recycling.
     */
    reset: reset
  };

  function reset() {
    currentInCache = 0;
  }

  function createNewState(node) {
    var cached = nodeCache[currentInCache];
    if (cached) {
      // TODO: This almost duplicates constructor code. Not sure if
      // it would impact performance if I move this code into a function
      cached.node = node;

      // How we came to this node?
      cached.p1 = null;
      cached.p2 = null;

      cached.closed = false;

      cached.g1 = Number.POSITIVE_INFINITY;
      cached.g2 = Number.POSITIVE_INFINITY;
      cached.f1 = Number.POSITIVE_INFINITY;
      cached.f2 = Number.POSITIVE_INFINITY;

      // used to reconstruct heap when fScore is updated.
      cached.h1 = -1;
      cached.h2 = -1;
    } else {
      cached = new NBASearchState(node);
      nodeCache[currentInCache] = cached;
    }
    currentInCache++;
    return cached;
  }
}

},{}],11:[function(require,module,exports){
module.exports = {
  aStar: require('./a-star/a-star.js'),
  aGreedy: require('./a-star/a-greedy-star'),
  nba: require('./a-star/nba/index.js'),
}

},{"./a-star/a-greedy-star":4,"./a-star/a-star.js":5,"./a-star/nba/index.js":9}],12:[function(require,module,exports){
let createGraph = require('ngraph.graph');
let g = createGraph();
let path = require('ngraph.path');

/*Rua1*/
g.addNode('r1-b1', {
	holes:0,
	semaphore:0,
	x: 1,
	y:2
});
g.addNode('r1-b2', {
	holes:0,
	semaphore:0,
	x: 1,
	y: 4
});
g.addNode('r1-b3', {
	holes:0,
	semaphore:0,
	x: 1,
	y: 6
});
g.addNode('r1-b4', {
	holes:0,
	semaphore:0,
	x: 1,
	y: 8
});



/*Rua7*/
g.addNode('r7-b1', {
	holes:0,
	semaphore:0,
	x: 12,
	y:2
});
g.addNode('r7-b2', {
	holes:0,
	semaphore:0,
	x: 12,
	y: 4
});
g.addNode('r7-b3', {
	holes:0,
	semaphore:0,
	x: 12,
	y: 6
});
g.addNode('r7-b4', {
	holes:0,
	semaphore:0,
	x: 12,
	y: 8
});



/*Rua8*/
g.addNode('r8-b1', {
	holes:0,
	semaphore:0,
	x: 23,
	y:2
});
g.addNode('r8-b2', {
	holes:0,
	semaphore:0,
	x: 23,
	y: 4
});
g.addNode('r8-b3', {
	holes:0,
	semaphore:0,
	x: 23,
	y: 6
});
g.addNode('r8-b4', {
	holes:0,
	semaphore:0,
	x: 23,
	y: 8
});




/*Rua2*/
g.addNode('r2-b1-01', {
	holes:1,
	semaphore:0,
	x: 2,
	y:1
});
g.addNode('r2-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:1
});
g.addNode('r2-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:1
});
g.addNode('r2-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:1
});
g.addNode('r2-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:1
});
g.addNode('r2-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:1
});
g.addNode('r2-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:1
});
g.addNode('r2-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:1
});
g.addNode('r2-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:1
});
g.addNode('r2-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:1
});

/*Rua2-Bloco2*/
g.addNode('r2-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:1
});
g.addNode('r2-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:1
});
g.addNode('r2-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:1
});
g.addNode('r2-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:1
});
g.addNode('r2-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:1
});
g.addNode('r2-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:1
});
g.addNode('r2-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:1
});
g.addNode('r2-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:1
});
g.addNode('r2-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:1
});
g.addNode('r2-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:1
});




/*Rua3*/
g.addNode('r3-b1-01', {
	holes:2,
	semaphore:0,
	x: 2,
	y:3
});
g.addNode('r3-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:3
});
g.addNode('r3-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:3
});
g.addNode('r3-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:3
});
g.addNode('r3-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:3
});
g.addNode('r3-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:3
});
g.addNode('r3-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:3
});
g.addNode('r3-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:3
});
g.addNode('r3-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:3
});
g.addNode('r3-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:3
});




/*Rua3-Bloco2*/
g.addNode('r3-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:3
});
g.addNode('r3-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:3
});
g.addNode('r3-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:3
});
g.addNode('r3-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:3
});
g.addNode('r3-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:3
});
g.addNode('r3-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:3
});
g.addNode('r3-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:3
});
g.addNode('r3-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:3
});
g.addNode('r3-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:3
});
g.addNode('r3-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:3
});




/*Rua4*/
g.addNode('r4-b1-01', {
	holes:0,
	semaphore:0,
	x: 2,
	y:5
});
g.addNode('r4-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:5
});
g.addNode('r4-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:5
});
g.addNode('r4-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:5
});
g.addNode('r4-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:5
});
g.addNode('r4-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:5
});
g.addNode('r4-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:5
});
g.addNode('r4-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:5
});
g.addNode('r4-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:5
});
g.addNode('r4-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:5
});




/*Rua4-Bloco2*/
g.addNode('r4-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:5
});
g.addNode('r4-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:5
});
g.addNode('r4-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:5
});
g.addNode('r4-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:5
});
g.addNode('r4-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:5
});
g.addNode('r4-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:5
});
g.addNode('r4-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:5
});
g.addNode('r4-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:5
});
g.addNode('r4-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:5
});
g.addNode('r4-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:5
});




/*Rua5*/
g.addNode('r5-b1-01', {
	holes:0,
	semaphore:0,
	x: 2,
	y:7
});
g.addNode('r5-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:7
});
g.addNode('r5-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:7
});
g.addNode('r5-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:7
});
g.addNode('r5-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:7
});
g.addNode('r5-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:7
});
g.addNode('r5-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:7
});
g.addNode('r5-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:7
});
g.addNode('r5-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:7
});
g.addNode('r5-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:7
});




/*Rua5-Bloco2*/
g.addNode('r5-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:7
});
g.addNode('r5-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:7
});
g.addNode('r5-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:7
});
g.addNode('r5-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:7
});
g.addNode('r5-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:7
});
g.addNode('r5-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:7
});
g.addNode('r5-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:7
});
g.addNode('r5-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:7
});
g.addNode('r5-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:7
});
g.addNode('r5-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:7
});




/*Rua6*/
g.addNode('r6-b1-01', {
	holes:0,
	semaphore:0,
	x: 2,
	y:9
});
g.addNode('r6-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:9
});
g.addNode('r6-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:9
});
g.addNode('r6-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:9
});
g.addNode('r6-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:9
});
g.addNode('r6-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:9
});
g.addNode('r6-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:9
});
g.addNode('r6-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:9
});
g.addNode('r6-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:9
});
g.addNode('r6-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:9
});




/*Rua6-Bloco2*/
g.addNode('r6-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:9
});
g.addNode('r6-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:9
});
g.addNode('r6-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:9
});
g.addNode('r6-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:9
});
g.addNode('r6-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:9
});
g.addNode('r6-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:9
});
g.addNode('r6-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:9
});
g.addNode('r6-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:9
});
g.addNode('r6-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:9
});
g.addNode('r6-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:9
});




/*LINKS GERAL*/
/*Links da Rua 1*/
g.addLink('r1-b1', 'r2-b1-01',{
	x:1,
	y:1
});
g.addLink('r1-b1', 'r3-b1-01',{
	x:1,
	y:3
});
g.addLink('r1-b2', 'r3-b1-01',{
	x:1,
	y:3
});
g.addLink('r1-b2', 'r4-b1-01',{
	x:1,
	y:5
});
g.addLink('r1-b3', 'r4-b1-01',{
	x:1,
	y:5
});
g.addLink('r1-b3', 'r5-b1-01',{
	x:1,
	y:7
});
g.addLink('r1-b4', 'r5-b1-01',{
	x:1,
	y:7
});
g.addLink('r1-b4', 'r6-b1-01',{
	x:1,
	y:9
});





/*Links da Rua 7*/
g.addLink('r7-b1', 'r2-b2-01',{
	x:21,
	y:1
});
g.addLink('r7-b1', 'r2-b1-10',{
	x:21,
	y:1
});
g.addLink('r7-b1', 'r3-b1-10',{
	x:21,
	y:3
});
g.addLink('r7-b1', 'r3-b2-01',{
	x:21,
	y:3
});
g.addLink('r7-b2', 'r3-b1-10',{
	x:21,
	y:3
});
g.addLink('r7-b2', 'r3-b2-01',{
	x:21,
	y:3
});
g.addLink('r7-b2', 'r4-b1-10',{
	x:21,
	y:5
});
g.addLink('r7-b2', 'r4-b2-01',{
	x:21,
	y:5
});
g.addLink('r7-b3', 'r4-b1-10',{
	x:21,
	y:5
});
g.addLink('r7-b3', 'r4-b2-01',{
	x:21,
	y:5
});
g.addLink('r7-b3', 'r5-b1-10',{
	x:21,
	y:7
});
g.addLink('r7-b3', 'r5-b2-01',{
	x:21,
	y:7
});
g.addLink('r7-b4', 'r5-b1-10',{
	x:21,
	y:7
});
g.addLink('r7-b4', 'r5-b2-01',{
	x:21,
	y:7
});
g.addLink('r7-b4', 'r6-b1-10',{
	x:21,
	y:9
});
g.addLink('r7-b4', 'r6-b2-01',{
	x:21,
	y:9
});




/*Links da Rua 8*/
g.addLink('r8-b1', 'r2-b2-10',{
	x:41,
	y:1
});
g.addLink('r8-b1', 'r3-b2-10',{
	x:41,
	y:3
});
g.addLink('r8-b2', 'r3-b2-10',{
	x:41,
	y:3
});
g.addLink('r8-b2', 'r4-b2-10',{
	x:41,
	y:5
});
g.addLink('r8-b3', 'r4-b2-10',{
	x:41,
	y:5
});
g.addLink('r8-b3', 'r5-b2-10',{
	x:41,
	y:7
});
g.addLink('r8-b4', 'r5-b2-10',{
	x:41,
	y:7
});
g.addLink('r8-b4', 'r6-b2-10',{
	x:41,
	y:9
});




/*Links da rua 2 - Bloco 1*/
g.addLink('r2-b1-01', 'r2-b1-02',{
	x:3,
	y:1
});
g.addLink('r2-b1-02', 'r2-b1-03',{
	x:5,
	y:1
});
g.addLink('r2-b1-03', 'r2-b1-04',{
	x:7,
	y:1
});
g.addLink('r2-b1-04', 'r2-b1-05',{
	x:9,
	y:1
});
g.addLink('r2-b1-05', 'r2-b1-06',{
	x:11,
	y:1
});
g.addLink('r2-b1-06', 'r2-b1-07',{
	x:13,
	y:1
});
g.addLink('r2-b1-07', 'r2-b1-08',{
	x:15,
	y:1
});
g.addLink('r2-b1-08', 'r2-b1-09',{
	x:17,
	y:1
});
g.addLink('r2-b1-09', 'r2-b1-10',{
	x:19,
	y:1
});




/*Links da rua 3 - Bloco 1*/
g.addLink('r3-b1-01', 'r3-b1-02',{
	x:3,
	y:3
});
g.addLink('r3-b1-02', 'r3-b1-03',{
	x:5,
	y:3
});
g.addLink('r3-b1-03', 'r3-b1-04',{
	x:7,
	y:3
});
g.addLink('r3-b1-04', 'r3-b1-05',{
	x:9,
	y:3
});
g.addLink('r3-b1-05', 'r3-b1-06',{
	x:11,
	y:3
});
g.addLink('r3-b1-06', 'r3-b1-07',{
	x:13,
	y:3
});
g.addLink('r3-b1-07', 'r3-b1-08',{
	x:15,
	y:3
});
g.addLink('r3-b1-08', 'r3-b1-09',{
	x:17,
	y:3
});
g.addLink('r3-b1-09', 'r3-b1-10',{
	x:19,
	y:3
});




/*Links da rua 4 - Bloco 1*/
g.addLink('r4-b1-01', 'r4-b1-02',{
	x:3,
	y:5
});
g.addLink('r4-b1-02', 'r4-b1-03',{
	x:5,
	y:5
});
g.addLink('r4-b1-03', 'r4-b1-04',{
	x:7,
	y:5
});
g.addLink('r4-b1-04', 'r4-b1-05',{
	x:9,
	y:5
});
g.addLink('r4-b1-05', 'r4-b1-06',{
	x:11,
	y:5
});
g.addLink('r4-b1-06', 'r4-b1-07',{
	x:13,
	y:5
});
g.addLink('r4-b1-07', 'r4-b1-08',{
	x:15,
	y:5
});
g.addLink('r4-b1-08', 'r4-b1-09',{
	x:17,
	y:5
});
g.addLink('r4-b1-09', 'r4-b1-10',{
	x:19,
	y:5
});



/*Links da rua 5 - Bloco 1*/
g.addLink('r5-b1-01', 'r5-b1-02',{
	x:3,
	y:7
});
g.addLink('r5-b1-02', 'r5-b1-03',{
	x:5,
	y:7
});
g.addLink('r5-b1-03', 'r5-b1-04',{
	x:7,
	y:7
});
g.addLink('r5-b1-04', 'r5-b1-05',{
	x:9,
	y:7
});
g.addLink('r5-b1-05', 'r5-b1-06',{
	x:11,
	y:7
});
g.addLink('r5-b1-06', 'r5-b1-07',{
	x:13,
	y:7
});
g.addLink('r5-b1-07', 'r5-b1-08',{
	x:15,
	y:7
});
g.addLink('r5-b1-08', 'r5-b1-09',{
	x:17,
	y:7
});
g.addLink('r5-b1-09', 'r5-b1-10',{
	x:19,
	y:7
});




/*Links da rua 6 - Bloco 1*/
g.addLink('r6-b1-01', 'r6-b1-02',{
	x:3,
	y:9
});
g.addLink('r6-b1-02', 'r6-b1-03',{
	x:5,
	y:9
});
g.addLink('r6-b1-03', 'r6-b1-04',{
	x:7,
	y:9
});
g.addLink('r6-b1-04', 'r6-b1-05',{
	x:9,
	y:9
});
g.addLink('r6-b1-05', 'r6-b1-06',{
	x:11,
	y:9
});
g.addLink('r6-b1-06', 'r6-b1-07',{
	x:13,
	y:9
});
g.addLink('r6-b1-07', 'r6-b1-08',{
	x:15,
	y:9
});
g.addLink('r6-b1-08', 'r6-b1-09',{
	x:17,
	y:9
});
g.addLink('r6-b1-09', 'r6-b1-10',{
	x:19,
	y:9
});




/*BLOCO DOIS*/
/*Links da rua 2 - Bloco 2*/
g.addLink('r2-b2-01', 'r2-b2-02',{
	x:23,
	y:1
});
g.addLink('r2-b2-02', 'r2-b2-03',{
	x:25,
	y:1
});
g.addLink('r2-b2-03', 'r2-b2-04',{
	x:27,
	y:1
});
g.addLink('r2-b2-04', 'r2-b2-05',{
	x:29,
	y:1
});
g.addLink('r2-b2-05', 'r2-b2-06',{
	x:31,
	y:1
});
g.addLink('r2-b2-06', 'r2-b2-07',{
	x:33,
	y:1
});
g.addLink('r2-b2-07', 'r2-b2-08',{
	x:35,
	y:1
});
g.addLink('r2-b2-08', 'r2-b2-09',{
	x:37,
	y:1
});
g.addLink('r2-b2-09', 'r2-b2-10',{
	x:39,
	y:1
});


/*Links da rua 3 - Bloco 2*/
g.addLink('r3-b2-01', 'r3-b2-02',{
	x:23,
	y:3
});
g.addLink('r3-b2-02', 'r3-b2-03',{
	x:25,
	y:3
});
g.addLink('r3-b2-03', 'r3-b2-04',{
	x:27,
	y:3
});
g.addLink('r3-b2-04', 'r3-b2-05',{
	x:29,
	y:3
});
g.addLink('r3-b2-05', 'r3-b2-06',{
	x:31,
	y:3
});
g.addLink('r3-b2-06', 'r3-b2-07',{
	x:33,
	y:3
});
g.addLink('r3-b2-07', 'r3-b2-08',{
	x:35,
	y:3
});
g.addLink('r3-b2-08', 'r3-b2-09',{
	x:37,
	y:3
});
g.addLink('r3-b2-09', 'r3-b2-10',{
	x:39,
	y:3
});



/*Links da rua 4 - Bloco 2*/
g.addLink('r4-b1-01', 'r4-b1-02',{
	x:23,
	y:5
});
g.addLink('r4-b2-02', 'r4-b2-03',{
	x:25,
	y:5
});
g.addLink('r4-b2-03', 'r4-b2-04',{
	x:27,
	y:5
});
g.addLink('r4-b2-04', 'r4-b2-05',{
	x:29,
	y:5
});
g.addLink('r4-b2-05', 'r4-b2-06',{
	x:31,
	y:5
});
g.addLink('r4-b2-06', 'r4-b2-07',{
	x:33,
	y:5
});
g.addLink('r4-b2-07', 'r4-b2-08',{
	x:35,
	y:5
});
g.addLink('r4-b2-08', 'r4-b2-09',{
	x:37,
	y:5
});
g.addLink('r4-b2-09', 'r4-b2-10',{
	x:39,
	y:5
});



/*Links da rua 5 - Bloco 2*/
g.addLink('r5-b2-01', 'r5-b2-02',{
	x:23,
	y:7
});
g.addLink('r5-b2-02', 'r5-b2-03',{
	x:25,
	y:7
});
g.addLink('r5-b2-03', 'r5-b2-04',{
	x:27,
	y:7
});
g.addLink('r5-b2-04', 'r5-b2-05',{
	x:29,
	y:7
});
g.addLink('r5-b2-05', 'r5-b2-06',{
	x:31,
	y:7
});
g.addLink('r5-b2-06', 'r5-b2-07',{
	x:33,
	y:7
});
g.addLink('r5-b2-07', 'r5-b2-08',{
	x:35,
	y:7
});
g.addLink('r5-b2-08', 'r5-b2-09',{
	x:37,
	y:7
});
g.addLink('r5-b2-09', 'r5-b2-10',{
	x:39,
	y:7
});



/*Links da rua 6 - Bloco 2*/
g.addLink('r6-b2-01', 'r6-b2-02',{
	x:23,
	y:9
});
g.addLink('r6-b2-02', 'r6-b2-03',{
	x:25,
	y:9
});
g.addLink('r6-b2-03', 'r6-b2-04',{
	x:27,
	y:9
});
g.addLink('r6-b2-04', 'r6-b2-05',{
	x:29,
	y:9
});
g.addLink('r6-b2-05', 'r6-b2-06',{
	x:31,
	y:9
});
g.addLink('r6-b2-06', 'r6-b2-07',{
	x:33,
	y:9
});
g.addLink('r6-b2-07', 'r6-b2-08',{
	x:35,
	y:9
});
g.addLink('r6-b2-08', 'r6-b2-09',{
	x:37,
	y:9
});
g.addLink('r6-b2-09', 'r6-b2-10',{
	x:39,
	y:9
});

/*Distance*/
let totaldistance = 0;
let arredondado = 0;

/*heuristic*/
let holes = 0;
let semaphore = 0;
let result = 0;

let pathFinder = path.aStar(g, {
	distance(from, to, link){
		let dx = from.data.x - to.data.x;
	 	let dy = from.data.y - to.data.y;
		let distance = Math.sqrt(dx * dx + dy * dy);
		arredondado = parseFloat(distance.toFixed(3));
		totaldistance += arredondado;
		return arredondado;
	},
	heuristic(from, to, link){
		let holes = from.data.holes - to.data.holes;
		let semaphore = from.data.semaphore - to.data.semaphore;
		let calc = Math.sqrt(holes * holes + semaphore * semaphore);
		result = parseFloat(calc.toFixed(1));
		return result
	}
});

let foundPath = pathFinder.find('r1-b1', 'r7-b1');

// console.log("--------------------------------------------------------------------------------");
// console.log(foundPath);
// console.log("--------------------------------------------------------------------------------");
//console.log("\n\n\nTotal Distance   ----------------------------------->"+totaldistance+"\n\n");
foundPath.forEach(function(node){
	console.log("Node"+node)
	var nodeSelector = node.id;
	console.log('.' + nodeSelector + " .ico");
	//console.log("Resultado"+result);
	document.querySelector( '.' + nodeSelector + " .ico").setAttribute('fill', 'green')
});

},{"ngraph.graph":2,"ngraph.path":11}]},{},[12]);
