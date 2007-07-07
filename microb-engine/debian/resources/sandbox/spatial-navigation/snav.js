 function MyNode(type, value, x, y, width, height, parent) {
   if (type=="QTree")
     return new QTree(value, x, y, width, height, parent);
   this.init.apply(this, arguments);
   return this;
}
function IDirected() {}
IDirected.prototype = {
 constructor: IDirected,
/* This is a 0 based equivalent of the Cartesian coordinate system
 * http://www.answers.com/topic/cartesian-coordinate-system#Two-dimensional_coordinate_system
 */
 EAST: 0,
 NORTH: 1,
 WEST: 2,
 SOUTH: 3,
 /* center of box */
 HCENTER: 4,
 VCENTER: 5,
 /* getVectorsFromNode has alternate inflexible boundary conditions defined from origin */
 BOUND_MIN: 6,
 BOUND_MAX: 7,
 ACROSS: 8,
 /* DOMNodes *stack* which means that conceptually up/down really should refer to zorder*/
 UP: 4,
 DOWN: 5,
 ENGLISH: [
  "EAST",
  "NORTH",
  "WEST",
  "SOUTH",
  "HCENTER",
  "VCENTER",
  "BOUND_MIN",
  "BOUND_MAX",
 ],
 cw: null,
 ccw: null,
 reverse: null,
 upper: null,
 lower: null,
 concat: function IDirected_concat(array, more) {
  if (!more)
   return;
  array.push.apply(array,more);
 },
 isPerpendicular: function IDirected_isPerpendicular(orientation, direction) {
  return orientation % 2 != direction % 2;
 },
 removeDuplicates: function IDirected_removeDuplicates(array) {
  for (var x = array.length; x--; ) {
   for (var y = x + 1; y < array.length; ++y) {
    if (array[x] === array[y])
     array.splice(y, 1);
   }
  }
 },
 init: function IDirected_init() {
  this.cw = [this.SOUTH, this.EAST, this.NORTH, this.WEST];
  this.ccw = [this.NORTH, this.WEST, this.SOUTH, this.EAST];
  this.reverse = [this.WEST, this.SOUTH, this.EAST, this.NORTH];
  /* 4-3*(orient % 2) */
  this.lower = [this.WEST, this.NORTH, this.WEST, this.NORTH];
  /* 3*(orient % 2) */
  this.upper = [this.EAST, this.SOUTH, this.EAST, this.SOUTH];
 }
}
IDirected.prototype.init();
MyNode.prototype = {
constructor: MyNode,
__proto__: new IDirected,
offsetParent: null,
nullXML: <x/>.x,
isNull: function (node) { return node == null || node == this.nullXML; },
get offsetLeft() {return this.x;},
get offsetTop() {return this.y;},
get offsetHeight() {return this.height;},
get offsetWidth() {return this.width;},
nextObject: 0,
init: function MyNode_init(type, value, x, y, width, height, parent) {
   this.objectId = ++MyNode.prototype.nextObject;
   this.type = type;
   this.value = value;
   this.x = x >> 0;
   this.y = y >> 0;
   this.width = width >> 0;
   this.height = height >> 0;
   this.parent = parent;
},
get left() {return this.x;},
get right() {return this.x + this.width;},
get top() {return this.y;},
get bottom() {return this.y + this.height;},
get vcenter() {return this.y + (this.height / 2) >> 0},
get hcenter() {return this.x + (this.width / 2) >> 0},
getLeft: function MyNode_getLeft(node) {if (node instanceof XML) return node.left; return node.offsetLeft + (node && node.offsetParent ? this.getLeft(node.offsetParent) : 0)},
getRight: function MyNode_getRight(node) {if (node instanceof XML) return node.left + node.width; return this.getLeft(node) + node.offsetWidth},
getTop: function MyNode_getTop(node) {if (node instanceof XML) return node.top; return node.offsetTop + (node && node.offsetParent ? this.getTop(node.offsetParent) : 0)},
getBottom: function MyNode_getBottom(node) {if (node instanceof XML) return node.top + node.height; return this.getTop(node) + node.offsetHeight},
getVCenter: function MyNode_getVCenter(node) {return (this.getTop(node) + node.offsetHeight / 2) >> 0},
getHCenter: function MyNode_getHCenter(node) {return (this.getLeft(node) + node.offsetWidth / 2) >> 0},
getIndentedNodeString: function MyNode_getIndentedNodeString(node) {
  return (""+node).replace(/^/mg, "  ");
},
getContainerString: function MyNode_getContainerString(x) {
  if (!this.children[x])
    return "";
  return " <QCell left="+this.getCellLeft(x)+
" right="+this.getCellRight(x)+
" top="+this.getCellTop(x)+
" bottom="+this.getCellBottom(x)+">\n"+
this.getIndentedNodeString(this.children[x])+
"\n </QCell>\n";
},
toString: function MyNode_toString() {
  var children = '';
  if (this.children) {
   for (var x = 0; x < 4; ++x)
     children += this.getContainerString(x);
   if (this.children[4]) {
     children += " <QStack>\n";
     for (var x = 5; x < this.children.length; ++x)
      children += this.getIndentedNodeString(this.children[x])+"\n";
     children += " </QStack>\n";
   }
  }
  return "<"+this.type+" objectId="+this.objectId+
    (this.value?" value='"+this.value+"'":"")+
    " area="+this.width*this.height+
    " left="+this.left+" right="+this.right+
    " top="+this.top+" bottom="+this.bottom+
    ">\n"+children+"</"+this.type+">";
 }
}
function Grid(value, x, y, width, height, parent) {
  this.init(this.constructor.name, value, x, y, width, height, parent);
}
Grid.prototype = {
__proto__: new MyNode,
constructor: Grid,
children: null,
unhandled: null,
addNodeToArray: function Grid_addNodeToArray(array, i, node) {
 if (!array[i])
  array[i] = [];
 if (node)
  array[i].push(node);
 return array[i];
},
getCell: function Grid_getCell(x, y) {
 x = (x / this.x) >> 0;
 y = (y / this.y) >> 0;
 var range = this.addNodeToArray(this.children, x);
 return this.addNodeToArray(range, y);
},
/* edges and orientations are equivalent, each box has a north, south, east, west edge */
getCellBound: function Grid_getCellBound(x, y, edge) {
 if (edge % 2)
  return this.y * (y + ((edge - 1) / 2));
 return this.x * (x + (3 - edge) / 2);
},
getNodeBound: function Grid_getNodeBound(node, edge) {
 switch (edge) {
 case this.WEST:
  return (this.getLeft(node) / this.x) >> 0;
  break;
 case this.EAST:
  return (this.getRight(node) / this.x) >> 0;
  break;
 case this.NORTH:
  return (this.getTop(node) / this.y) >> 0;
  break;
 case this.SOUTH:
  return (this.getBottom(node) / this.y) >> 0;
  break;
 case this.HCENTER:
  return ((this.getLeft(node) + this.getRight(node)) / this.x) >> 1;
  break;
 case this.VCENTER:
  return ((this.getTop(node) + this.getBottom(node)) / this.y) >> 1;
  break;
 default:
 }
 return NaN;
},
addNode: function Grid_addNode(node) {
 var west = this.getNodeBound(node, this.WEST);
 var east = this.getNodeBound(node, this.EAST);
 var north = this.getNodeBound(node, this.NORTH);
 var south = this.getNodeBound(node, this.SOUTH);
 if (0) {
  this.unhandled.push(node);
  return;
 }
 /* we intentionally start one to the right of west,
  * and stop one to the left of east, the following loop
  * operates on west and east directly.
  * A picture, first pass we do --s, second pass we do |s.
  * |-|
  * | |
  * |-|
  */
 for (var x = west + 1; x < east; ++x) {
  var range = this.addNodeToArray(this.children, x, null);
  this.addNodeToArray(range, north, node);
  if (north == south)
   continue;
  this.addNodeToArray(range, south, node);
 }
 east = east == west ? null : this.addNodeToArray(this.children, east, null);
 west = this.addNodeToArray(this.children, west, null);
 for (var y = north; y <= south; ++y) {
  this.addNodeToArray(west, y, node);
  if (!east)
   continue;
  this.addNodeToArray(east, y, node);
 }
},
gets: [
 "getRight",
 "getTop",
 "getLeft",
 "getBottom",
 "getHCenter",
 "getVCenter",
],
sorts: [
 function rightSort(a, b) {
  return MyNode.prototype.getRight(a) - MyNode.prototype.getRight(b);
 },
 function topSort(a, b) {
  return MyNode.prototype.getTop(a) - MyNode.prototype.getTop(b);
 },
 function leftSort(a, b) {
  return MyNode.prototype.getLeft(a) - MyNode.prototype.getLeft(b);
 },
 function bottomSort(a, b) {
  return MyNode.prototype.getBottom(a) - MyNode.prototype.getBottom(b);
 },
],
maybeAdd: function Grid_maybeAdd(controls, orient, cand, dims, bounds, val) {
 switch (orient) {
 case this.WEST:
 case this.NORTH:
  if (val > dims[orient])
   return false;
  break;
 case this.EAST:
 case this.SOUTH:
  if (val < dims[orient])
   return false;
  break;
 }
 switch (orient) {
 case this.EAST:
 case this.WEST:
  if ((this.getBottom(cand) < bounds[this.BOUND_MIN]) ||
      (this.getTop(cand) > bounds[this.BOUND_MAX]))
   return false;
  break;
 case this.NORTH:
 case this.SOUTH:
  if ((this.getRight(cand) < bounds[this.BOUND_MIN]) ||
      (this.getLeft(cand) > bounds[this.BOUND_MAX]))
   return false;
  break;
 }
 var skip = controls[4];
 for (var i = 0; i < skip.length; ++i) {
  if (skip[i] == cand)
   return false;
 }
 switch (orient) {
 case this.EAST:
 case this.SOUTH:
  bounds[this.BOUND_MAX] = Math.min(bounds[this.BOUND_MAX] || Infinity, val);
  break;
 case this.NORTH:
 case this.WEST:
  bounds[this.BOUND_MIN] = Math.max(bounds[this.BOUND_MIN] || -Infinity, val);
  break;
 }
 controls[orient].push(cand);
 skip.push(cand);
 return true;
},
ensureGridXY: function Grid_ensureGridXY(x, y) {
 return this.children[x] && this.children[x][y];
},
northwestTilt: [
 1, -1, -1, 1,
],
ensureGridXY2: function Grid_ensureGridXY2(bounds, orient, k, j, delta) {
 var i = bounds[this.HCENTER + orient % 2] + k * j;
 var l = bounds[this.VCENTER - orient % 2] + this.northwestTilt[orient] * delta;
 switch (orient) {
 case this.EAST:
 case this.WEST:
  return this.ensureGridXY(l, i);
 case this.NORTH:
 case this.SOUTH:
  return this.ensureGridXY(i, l);
 }
 return null;
},
getNodesAroundPoint: function Grid_getNodesAroundPoint(originX, originY, range, limit) {
 var found = [];
 /* XXX we assert that this.x == this.y == this.scale */
 range = (range / this.x) >> 0;
 var dims = [];
 var x = (originX / this.x) >> 0;
 var y = (originY / this.y) >> 0;
 var bounds = [x, y, x, y, x, y];
 var j, k, orient;
 this.concat(found, this.ensureGridXY(bounds[this.HCENTER], bounds[this.VCENTER]));
 for (var delta = 0; delta <= range && found.length < limit; ++delta) {
  for (j = 1; j < delta + 1; ++j) {
   for (k = -1; k <= 1; k += 2) {
    for (orient = this.EAST; orient <= this.SOUTH; ++orient) {
     this.concat(found, this.ensureGridXY2(bounds, orient, k, j, delta));
    }
   }
  }
 }
 this.removeDuplicates(found);
 return found;
},
getVectorsFromNode: function Grid_getVectorsFromNode(node, controls, orientation, turning, limit) {
 var delta = 0;
 var done = false;
 var dims = [];
 var bounds = [];
 var i, j, k, l, x, y, range, orient, cand;
 for (i = this.EAST; i <= this.VCENTER; ++i) {
  dims[i] = this[this.gets[i]](node);
  bounds[i] = this.getNodeBound(node, i);
 }
 bounds.length = 8;

 /* we favor progressing south, then east, then north, then west.
  * to do this, nodes which can be found in the opposing directions are sorted
  * to them instead.
  *
  * we favor cardinals over secondary cardinals so we work our way out like a vibrating straw.
  */
 var orientations = [this.WEST, this.NORTH, this.EAST, this.SOUTH];
if (0) {
 /**
  * we only want to look at orientations where there isn't navigation information
  */
 if (turning) {
  controls[this.cw[orientation]].length = 0;
  controls[this.ccw[orientation]].length = 0;
 }
 for (var i = 0; i < 4; ++i) {
  orient = orientations[i];
  if (controls[orient].length < 3)
   orientations.push(orient);
 }
 orientations.splice(0, 4);
if (0) {
  if (!headings[orientation].length) {
  } else {
  }
}
} else {
 /* east..south, skip */
 for (i = 0; i <= 4; ++i) {
  controls[i] = [node];
 }
}
 do {
  orient = orientation;
  var neworientations = orientations.concat();
  for (j = 0; j <= delta; ++j) {
   for (k = -1; k <= 1; k += 2) {
    for (l = 0; l < orientations.length; ++l) {
     orient = orientations[l];
     range = this.ensureGridXY2(bounds, orient, k, j, delta);
     if (!range)
      continue;
     for (i = 0; i < range.length; ++i) {
      cand = range[i];
      if (cand == node)
       continue;
      var getNatural = this.gets[orient];
      if (this.maybeAdd(controls, orient, cand, dims, bounds, this[getNatural](cand)) &&
          this.isPerpendicular(orient, orientation)) {
       /* we're looking for a box that doesn't intersect with our box
        * such a box is used to create a search boundaries in |orient| when we look in
        * |orientation| or |reverse[orientation]|.
        */
       var val = this[this.gets[this.reverse[orient]]](cand);
       var edge = this[getNatural](node);
       var curBound;
       switch (orient) {
       case this.EAST:
       case this.SOUTH:
        if (val > edge && ((curBound = bounds[this.BOUND_MAX]) == undefined || val < curBound)) {
         bounds[this.BOUND_MAX] = val;
         if (curBound == undefined)
          neworientations.splice(l, 1);
        }
        break;
       case this.WEST:
       case this.NORTH:
        if (val < edge && ((curBound = bounds[this.BOUND_MIN]) == undefined || val > curBound)) {
         bounds[this.BOUND_MIN] = val;
         if (curBound == undefined)
          neworientations.splice(l, 1);
        }
        break;
       default:
       }
      }
     }
    }
   }
  }
  orientations = neworientations;
  delta++;
  done = (delta > 25) || (controls[4].length > limit);
 } while (!done);
 var bounds = this.getRealNodeBounds(node);
 for (orient = this.EAST; orient <= this.SOUTH; ++orient) {
  range = controls[orient];
  range.sort(this.sorts[orient]);
  if (range[0] == node)
   range.shift();
  else if (range[range.length-1] == node)
   range.length--;
 }
/* this should be integrated into the main loop */
 var orientations = [this.WEST, this.NORTH, this.EAST, this.SOUTH];
 for (i = 0; orientations.length; i++) {
  for (j = 0; j < orientations.length; ++j) {
   orient = orientations[j];
   range = controls[orient];
   if (i >= range.length) {
    /* we're removing the current orientation
     * and going back to what will be here
     */
    orientations.splice(j--, 1);
    continue;
   }
   if (this.shouldDropParallelNode(bounds, range, i, orient)) {
    /* we're removing the current node
     * and going back to what will be here
     */
    range.splice(i--, 1);
   }
  }
 }
},
getRealNodeBounds: function Grid_getRealNodeBounds(node) {
 return [
  this.getRight(node),
  this.getTop(node),
  this.getLeft(node),
  this.getBottom(node),
 ];
},
shouldDropParallelNode: function Grid_shouldDropParallelNode(bounds, range, i, orient) {
 var node = range[i];
 var bound = this.getRealNodeBounds(node);
 var val;
 var upper = this.upper[orient];
 var lower = this.lower[orient];
 var rotated = this.cw[orient];
 if (bounds[upper] > bound[upper] &&
     bounds[lower] < bound[lower] &&
     (((val = bounds[this.BOUND_MIN]) != undefined &&
        val > bound[this.upper[rotated]]) ||
     ((val = bounds[this.BOUND_MAX]) != undefined &&
       val < bound[this.lower[rotated]]))
 ) {
  return true;
 }
 bounds[orient] = bound[orient];
 return false;
},
init: function Grid_init(type, value, x, y, width, height, parent) {
 this.children = [];
 this.unhandled = [];
 MyNode.prototype.init.apply(this, arguments);
} 
}
function QTree(value, x, y, width, height, parent) {
  this.init(this.constructor.name, value, x, y, width, height, parent);
}
QTree.prototype = {
__proto__: new MyNode,
constructor: QTree,
children: null,
TOP_RIGHT: 0,
TOP_LEFT: 1,
BOTTOM_LEFT: 2,
BOTTOM_RIGHT: 3, 
FULL_NODE: 4,
MINIMUM_CELL_SIZE: 4,
/* cells should really have numbers
 10
 23
is probably a reasonable numbering.
I wonder what the odds are that the algorithm actually matches :)
 */
getCell: function QTree_getCell(x, y) {
  if (y > this.bottom || x > this.right || y < this.top || x < this.left)
    return -1;
  return 2 * (y > this.vcenter) + ((x < this.hcenter) ^ (y > this.vcenter)) ;
},
getCellLeft: function QTree_getCellLeft(index) {
 switch (index) {
 case this.TOP_LEFT:
 case this.BOTTOM_LEFT:
 case this.FULL_NODE:
 default:
  return this.left;
 case this.TOP_RIGHT:
 case this.BOTTOM_RIGHT:
  return this.hcenter;
 }
},
getCellRight: function QTree_getCellRight(index) {
 switch (index) {
 case this.TOP_LEFT:
 case this.BOTTOM_LEFT:
  return this.hcenter;
 case this.TOP_RIGHT:
 case this.BOTTOM_RIGHT:
 case this.FULL_NODE:
 default:
  return this.right;
 }
},
getCellTop: function QTree_getCellTop(index) {
 switch (index) {
 case this.TOP_LEFT:
 case this.TOP_RIGHT:
 case this.FULL_NODE:
 default:
  return this.top;
 case this.BOTTOM_LEFT:
 case this.BOTTOM_RIGHT:
  return this.vcenter;
 }
},
getCellBottom: function QTree_getCellBottom(index) {
 switch (index) {
 case this.TOP_LEFT:
 case this.TOP_RIGHT:
  return this.vcenter;
 case this.BOTTOM_LEFT:
 case this.BOTTOM_RIGHT:
 case this.FULL_NODE:
 default:
  return this.bottom;
 }
},
insertNode: function QTree_insertNode(idx, node) {
   if (idx == -1)
     return;
   do {
     if (!this.children[idx]) {
       this.children[idx] = node;
       return;
     }
     if (this.children[idx] == node)
       return;
     if (idx >= this.FULL_NODE)
       ++idx;
   } while (idx > this.FULL_NODE);
   if (this.children[idx] instanceof QTree) {
     this.children[idx].addChild(node);
     return;
   }
   var width = this.width / 2;
   var height = this.height / 2;
   if (width < this.MINIMUM_CELL_SIZE || height < this.MINIMUM_CELL_SIZE) {
     this.insertNode(this.FULL_NODE, node);
     return;
   }
   var oldChild = this.children[idx];
   this.children[idx] = null;
/*print("new QTree(" 0, this.getCellLeft(idx), this.getCellTop(idx), width, height, this, "); ");*/
   var child = new QTree(0, this.getCellLeft(idx), this.getCellTop(idx), width, height, this);
   child.addChild(oldChild);
   child.addChild(node);
   this.children[idx] = child;
},
addChild: function QTree_addChild(child) {
   var left = MyNode.prototype.getLeft(child);
   var right = MyNode.prototype.getRight(child);
   var top = MyNode.prototype.getTop(child);
   var bottom = MyNode.prototype.getBottom(child);
   if (this.left >= left &&
       this.right <= right &&
       this.top >= top &&
       this.bottom <= bottom)
   {
     this.insertNode(this.FULL_NODE, child);
     return;
   }
   var coords = [
     this.getCell(right, top),
     this.getCell(left, top),
     this.getCell(left, bottom),
     this.getCell(right, bottom),
   ];
   var cell;
   var maxcell = -1;
   for (var i = 0; i < 4; ++i) {
    if ((cell = coords[i]) > -1 && cell > maxcell)
     this.insertNode(maxcell = cell, child);
   }
},
init: function QTree_init(type, value, x, y, width, height, parent) {
   this.children = [];
   this.children.length = 5;
   MyNode.prototype.init.apply(this, arguments);
} 
}
function ISpatialNavigation() {}
ISpatialNavigation.prototype = {
 constructor: ISpatialNavigation,
 __proto__: new IDirected,
 TRAVERSAL_DIRECTIONS: 6,
 NAVIGABLE_INCREMENT: 128,
 NAVIGABLE_WIDTH: 275,
 NAVIGABLE_HEIGHT: 200,
 INSERTION_FACTOR: .3
}
function SpatialNavigator(service, window) {
 if ("nsISpatialNavigation" in Components.interfaces)
  this.interfaces.push(Components.interfaces.nsISpatialNavigation);
 this.mService = service;
 this.init(window);
}
SpatialNavigator.prototype = {
constructor: SpatialNavigator,
interfaces: [
 Components.interfaces.nsISupports,
 Components.interfaces.nsIDOMEventListener,
 Components.interfaces.nsIWebProgressListener,
 Components.interfaces.nsISupportsWeakReference,
],
QueryInterface: QI,
__proto__: new ISpatialNavigation,
/* nsISpatialNavigation */
init: function SpatialNavigator_init(window) {
 this.availableNodes = [];
 this.availableNodes.length = ISpatialNavigation.prototype.TRAVERSAL_DIRECTIONS;
 this.mTopWindow = window;
 try {
  var target = this.mTopWindow;
  target.addEventListener("keypress", this, false);
  target.addEventListener("scroll", this, false);
  this.mTopWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIWebNavigation)
      .QueryInterface(Components.interfaces.nsIWebProgress)
      .addProgressListener(this, 0x000000ff);
 } catch (e) {}
 try {
  this.mFlasher = Components.classes["@mozilla.org/inspector/flasher;1"].getService(Components.interfaces.inIFlasher);
 } catch (e) {
  this.mFlasher = {
   scrollElementIntoView: function (){},
   drawElementOutline: function (){},
   repaintElement: function (){}
  };
 }
 this.flashes = [];
},
shutdown: function SpatialNavigator_shutdown() {
/* getEventTargetFromWindow */
 try {
  var target = this.mTopWindow;
  target.removeEventListener("keypress", this, false);
 } catch (e) {}
 this.availableNodes = null;
 this.mTopWindow = null;
},
right: function SpatialNavigator_right() {
 return this.handleMove(this.EAST);
},
up: function SpatialNavigator_up() {
 return this.handleMove(this.NORTH);
},
left: function SpatialNavigator_left() {
 return this.handleMove(this.WEST);
},
down: function SpatialNavigator_down() {
 return this.handleMove(this.SOUTH);
},
handleMove: function SpatialNavigator_handleMove(direction) {
 var node;
 if (!this.focussedElement) {
  /* logic for insertFocus goes here */
  node = this.insertFocus(direction);
 } else {
  node = this.traverse(direction);
 }
 this.previewNavigation(node);
 if (node)
  return node;
 // temporary until scrollWindow is implemented
 return false;
 this.scrollWindow(direction);
 return true;
},
cardinalColor: function SpatialNavigator_cardinalColor(direction, i) {
 var color = "66cc99";
 if (i) {
  i = i <= 3 ? i : 3;
  switch (direction) {
  case this.WEST:
   color = "ffff" + (4-i)*33;
   break;
  case this.EAST:
   color = "00"+(0x33*(i+2)).toString(16)+"00";
   break;
  case this.NORTH:
   color = (0x33*(3+3-i)).toString(16) + "0000";
   break;
  case this.SOUTH:
   color = "ff"+(33*(i-1)+11)+"ff";
   break;
  default:
   return "gray";
  }
 }
 return "#" + color;
},
previewNavigation: function SpatialNavigator_previewNavigation(node) {
 if (node) {
  for (var direction = this.EAST; direction <= this.SOUTH; direction++) {
   for (var i = 1; i <= 3; ++i) {
    var preview = this.traverse(direction, i);
    if (!preview)
     break;
    this.addFlash(preview, 10, 3, true, this.cardinalColor(direction, i), 2*(4-i), false);
   }
  }
 } else {
  /* this is where this.insertFocus(_alldirections_, preview=true) should be used */
 }
},
scrollWindow: function SpatialNavigator_scrollWindow(direction) {
 var contentWindow = this.mTopWindow;
 switch (direction) {
 case this.WEST:
  contentWindow.scrollBy(-1* this.mService.gScrollOffset, 0);
  break;
 case this.EAST:
  contentWindow.scrollBy(this.mService.gScrollOffset, 0);
  break;
 case this.NORTH:
  contentWindow.scrollBy(0, -1 * this.mService.gScrollOffset);
  break;
 case this.SOUTH:
  contentWindow.scrollBy(0, this.mService.gScrollOffset);
  break;
 }
},
addFlash: function SpatialNavigator_addFlash(node, aDuration, aSpeed, aHold, aColor, aThickness, aInvert)
{
 if (!node)
  return -1;
 var flashRule = {
  element: node,
  stopTime: Date.now()+(aDuration||5)*1000,
  speed: aSpeed || 10,
  keep: aHold,
  color: aColor || "green",
  flashCount: 0,
  invert: aInvert,
  thickness: aThickness || 3
 };
 var i = this.flashes.push(flashRule) - 1;
 this.flash(i);
 return i;
},
flash: function SpatialNavigator_flash(rule) {
 var flashRules = (rule == "all")
                ? this.flashes
                : [(rule - 0 == rule) ? this.flashes[rule] : rule];
 for (var i = 0; i < flashRules.length; ++i) try {
  var flashRule = flashRules[i];
  this.mFlasher.color = flashRule.color;
  this.mFlasher.thickness = flashRule.thickness;
  this.mFlasher.invert = flashRule.invert;
  if (flashRule.keep || flashRule.flashCount % 2) {
   this.mFlasher.drawElementOutline(flashRule.element);
  } else {
   this.mFlasher.repaintElement(flashRule.element);
  }
  flashRule.flashCount++;
 } catch (e) {}
},
removeFlash: function SpatialNavigator_removeFlash(rule)
{
 if (!this.flashes.length)
  return;
 var flashRules;
 if (rule == "all") {
  flashRules = this.flashes;
  this.flashes = [];
 } else {
  var i = rule - 0;
  var notFound = true;
  if (i != rule) {
   for (i = this.flashes.length; i && (notFound = this.flashes[--i].element != rule); );
   if (notFound)
    return;
  }
  flashRules = this.flashes.splice(i, 1);
 }
 for (i = 0; i < flashRules.length; ++i) {
  flashRule = flashRules[i];
  flashRule.keep = false;
  flashRule.flashCount = 0;
  try {
   this.flash(flashRule);
  } catch (e) {}
 }
},
/* nsIDOMEventListener */
handleEvent: function SpatialNavigator_handleEvent(event) {
 if (!this.document)
  return;
 switch (event.type) {
 case "keyup":
  this.keyUp(event);
  break;
 case "keypress":
  this.keyPress(event);
  break;
 case "keydown":
  this.keyDown(event);
  break;
 case "x-scroll":
  this.visualRange = null;
  break;
 case "unload":
  if (event.target == this.mTopWindow.document ||
      event.target == this.mTopWindow.contentDocument)
  this.visualRange = null;
  break;
 case "load":
  if (event.target == this.mTopWindow.document ||
      event.target == this.mTopWindow.content.document) {
   this.document = event.target;
   this.visualRange = null;
  }
  break;
 }
},
keyUp: function SpatialNavigator_keyUp(event) {
/* XXX should record the event to make press work better */
},
keyPress: function SpatialNavigator_keyPress(event) {
/* XXX should check records of down and up and do work here */
 this.handleKey(event);
},
keyDown: function SpatialNavigator_keyDown(event) {
/* XXX should record the event to make press work better */
},
handleKey: function SpatialNavigator_handleKey(event) {
 if (!this.mService.mEnabled)
  return;
 try {
  if (event instanceof Components.interfaces.nsIDOMNSUIEvent &&
      event.getPreventDefault())
   return;
 } catch (e) {
 }
 var formControlType = -1;
 var eventInternal = event.QueryInterface(Components.interfaces.nsIDOMNSEvent);
 var domEventTarget = eventInternal.originalTarget;
 function nodeIsXUL(node) { return false; }
 if (nodeIsXUL(domEventTarget))
  return;
 if (this.mService.mIgnoreTextFields) {
  if (domEventTarget instanceof Components.interfaces.nsIDOMHTMLTextAreaElement ||
      (domEventTarget instanceof Components.interfaces.nsIDOMHTMLInputElement &&
       (/^(?:|text|password|file)$/i.test(domEventTarget.type))) ||
      domEventTarget instanceof Components.interfaces.nsIDOMHTMLIsIndexElement
     ) {
   return;
  }
 }
 var keyEvent = event.QueryInterface(Components.interfaces.nsIDOMKeyEvent);
 var keyCode = keyEvent.keyCode;
 const keyCodeModifier = this.mService.mKeyCodeModifier;
  // figure out what modifier to use 
 const SHIFT          = 0x00100000;
 const CONTROL        = 0x00001100;
 const ALT            = 0x00000012;
  if ((keyCodeModifier & SHIFT) ^ keyEvent.shiftKey)
   return;
  if ((keyCodeModifier & CONTROL) ^ keyEvent.ctrlKey)
   return;
  if ((keyCodeModifier & ALT) ^ keyEvent.altKey)
   return;
 var action;
 var left = false;
 switch (keyCode) {
 case this.mService.mKeyCodeLeft:
  left = true;
 case this.mService.mKeyCodeRight:
/* ISINDEX!! */
  if ((domEventTarget instanceof Components.interfaces.nsIDOMHTMLInputElement && (
      domEventTarget.type == "text" || domEventTarget.type == "password"))||
      domEventTarget instanceof Components.interfaces.nsIDOMHTMLTextAreaElement) {
   if (left) {
    if (domEventTarget.textLength && domEventTarget.selectionStart)
     return;
   } else {
    if (domEventTarget.textLength != domEventTarget.selectionEnd)
     return;
   }
  }
  action = left ? "left" : "right";
  break;
 case this.mService.mKeyCodeUp:
/* SELECT!! */
  action = "up";
  break;
 case this.mService.mKeyCodeDown:
/* SELECT!! */
  action = "down";
  break;
 default:
  return;
 }
 var now = Date.now();
 var delta = now - this.last;
 this.last = now;
 if (delta < 200)
  return;
 try {
  var node = this[action]();
 } catch (e) {}
 if (node) {
  event.stopPropagation();
  event.preventDefault();
 }
},
get attachedWindow() {
 return this.mTopWindow;
},
get focussedElement() {
 return this._focussedElement;
},
set focussedElement(node) {
 var old = this.focussedElement;
 if (old == node)
  return;
 if (old)
  this.removeFlash("all");
 if (node)
  this.addFlash(node, 10, 3, true, this.cardinalColor(0, 0), 8, false);
 this._focussedElement = node;
},
distanceBetweenPoints: function distanceBetweenPoints(x1, y1, x2, y2)
{
 var xd = x1-x2;
 var yd = y1-y2;
 return xd*xd+yd*yd;
},
x:function x(){
/*
 * this will return an array like creature which has a valueOf property returning the smallest distance
 * it will also have a direction property indicating which direction is the smallest distance
 * and as an array, it will have distances for each direction
 *
 * the direction argument will probably be ignored
 */
function distanceBetweenNodes(node1, node2, direction) {
 if (MyNode.prototype.getLeft(node1) <= MyNode.prototype.getLeft(node2) &&
     MyNode.prototype.getRight(node1) >= MyNode.prototype.getRight(node2)) {
   /* ? */
 }
 var x2 = MyNode.prototype.getRight(node1);
 var x3 = MyNode.prototype.getLeft(node2);
 var x4 = node;
 switch (direction) {
 case undefined:
 default:
 case this.DOWN:
  break;
 case this.EAST:
  break;
 case this.NORTH:
  break;
 case this.WEST:
  break;
 case this.SOUTH:
  break;
 case this.UP:
  break;
 }
}
/*
 * favoritism
 *
 * If two objects are equally close to a third object but differ by direction, we want to cause objects that are (in this order) to be seen as closest
 * West, North, East, South
 * This is designed to cause the sorting system to put fewer objects south/east of the origin and more objects north/west of the origin. This should make it easier to progress down the page than up the page.
 *
 * If two objects are equally close to a third object in the same direction, we want to favor South if going East, North if going West, East if going South, West if going North.
 * This should approximate the idea that South and East are progressing "down a page", and West and North are progressing "up the page".
 */
function sortNodes(originNode, node1, node2) {
  var originNodePosX = MyNode.prototype.getLeft(originNode);
  var originNodePosY = MyNode.prototype.getTop(originNode);
  var node1PosX = MyNode.prototype.getLeft(node1);
  var node1PosY = MyNode.prototype.getTop(node1);
  var node2PosX = MyNode.prototype.getLeft(node2);
  var node2PosY = MyNode.prototype.getTop(node2);
  var distanceOriginNode1X = originNodePosX - node1PosX;
  var distanceOriginNode1Y = originNodePosY - node1PosY;
  var distanceOriginNode2X = originNodePosX - node2PosX;
  var distanceOriginNode2Y = originNodePosY - node2PosY;
  /*
   * Figure out in which directions the different nodes are.
   */
  return -1;
}
},
get document() {
 var window = this.mTopWindow;
 if (!window)
  return null;
 var document = window.document;
 if (!(document instanceof Components.interfaces.nsIDOMXULDocument))
  return document;
 return window.content && window.content.document;
},
get viewport() {
 if (!this.document)
  return null;
 return (this.document instanceof XML) ? this.mTopWindow.screen : this.document.body;
},
get availWidth() {
 return this.viewport.clientWidth;
},
get availHeight() {
 return this.viewport.clientHeight;
},
get clientLeft() {
 return this.viewport.scrollLeft;
},
get clientTop() {
 return this.viewport.scrollTop;
},
insertFocus: function SpatialNavigator_insertFocus(direction) {
 var horizontalFactor, verticalFactor;
 switch (direction) {
 case this.EAST:
  horizontalFactor = .5+this.INSERTION_FACTOR;
  verticalFactor = .5;
  break;
 case this.NORTH:
  horizontalFactor = .5;
  verticalFactor = .5-this.INSERTION_FACTOR;
  break;
 case this.WEST:
  horizontalFactor = .5-this.INSERTION_FACTOR;
  verticalFactor = .5;
  break;
 case this.SOUTH:
  horizontalFactor = .5;
  verticalFactor = .5+this.INSERTION_FACTOR;
  break;
 default:
  horizontalFactor = .5;
  verticalFactor = .5;
  break;
 }
 if (!this.ensureVisualRange())
  return null;
 var nodes = this.visualRange.getNodesAroundPoint(
    this.clientLeft + this.availWidth * horizontalFactor,
    this.clientTop + this.availHeight * verticalFactor,
    Math.max(this.NAVIGABLE_WIDTH, this.NAVIGABLE_HEIGHT),
    1);
 var node = nodes[0];
 this.focussedElement = node;
 this.headings = null;
 this.nextElementIsNull = null;
 this.orientation = null;
 print("insertFocus(" + this.ENGLISH[direction] + "): " + (node ? node.toString() : "null") + "\n");
 return node;
},
buildVisualRange: function SpatialNavigator_buildVisualRange() {
 if (!this.document)
  return;
 var root = {addNode:function(){}};
 var x = this.clientLeft;
 var y = this.clientTop;
 this.visualRange = root = new Grid("traversable grid", 32, 32, this.availWidth, this.availHeight, null);
 if (0) {
  /* walking trees is probably faster but coding it requires a bit more work. */
  var walker = this.document.createTreeWalker(
   this.document.firstChild,
   Components.interfaces.nsIDOMNodeFilter.SHOW_ELEMENT,
   {
    acceptNode: function SpatialNavigator_TreeWalker_acceptNode(node)
    {
     return Components.interfaces.nsIDOMNodeFilter.FILTER_ACCEPT;
    }
   },
   false);
  while ((node = walker.nextNode())) {
   root.addNode(new MyNode(node.tagName,
                                                  node,
                                                  MyNode.prototype.getLeft(node),
                                                  MyNode.prototype.getRight(node),
                                                  node.offsetWidth,
                                                  node.offsetHeight));
  }
 } else {
  var props = [
   "textarea",
   "input",
   "isindex",
   "button",
   "select",
  ];
  var html = this.document instanceof Components.interfaces.nsIDOMHTMLDocument;
  if (html) {
function hack(node) {
 if (node.firstChild instanceof Components.interfaces.nsIDOMHTMLImageElement)
  return node.firstChild;
 return node;
}
   var nodes = this.document.links;
   for (var i = 0; i < nodes.length; ++i) {
    var node = hack(nodes[i]);
    if (this.isVisible(node)) {
     root.addNode(node);
    }
   }
  } else {
   props.push("a");
  }
  for (var j = 0; j < props.length; ++j) {
   nodes = html
         ? this.document.getElementsByTagName(props[j])
         : this.document.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", props[j]);
   for (var i = 0; i < nodes.length; ++i) {
    node = nodes[i];
    if (this.isVisible(node)){
     root.addNode(node);
    }
   }
  }
 }
},
isVisible: function SpatialNavigator_isVisible(node) {
 if (!node.scrollWidth || !node.scrollHeight)
  return false;
 var screen = node.ownerDocument.defaultView;
 while (node instanceof Components.interfaces.nsIDOMElement) {
  var style = screen.getComputedStyle(node, "");
  if (style.display=="none" || style.visibility=="collapsed")
   return false;
  node = node.parentNode;
 }
 return true;
},
ensureVisualRange: function SpatialNavigator_ensureVisualRange() {
 if (60000 + this.visualRangeInitializedTime  > Date.now()) {
  this.visualRange = null;
 }
 if (!this.visualRange) {
  this.buildVisualRange();
 }
 return this.visualRange;
},
traverse: function SpatialNavigator_traverse(orientation, preview) {
 var node = this.focussedElement;
 if (!node) {
  print("SpatialNavigator_traverse called but !this.focussedElement");
  return null;
 }
 if (!this.ensureVisualRange())
  return null;
 if (!preview) {
  if (this.nextElementIsNull && this.orientation == orientation) {
   this.focussedElement = null;
   this.headings = null;
   this.orientation = null;
   this.nextElementIsNull = null;
  }
  // this is strange
  if (this.orientation == null) {
   this.orientation = orientation;
  }
 }
 if (!this.headings) {
  this.headings = [[],[],[],[]];
 }
 var headings = this.headings;
 var turning = this.isPerpendicular(this.orientation, orientation);
 if (preview) {
  return headings[orientation].length > preview ? headings[orientation][preview - 1] : null;
 }
 /* try always calling getVectorsFromNode instead of only sometimes */
 if (!preview) {
  if (!headings[orientation].length) {
   this.visualRange.getVectorsFromNode(node, this.headings, orientation, turning);
  } else {
   if (turning) {
    headings[this.cw[orientation]].length = 0;
    headings[this.ccw[orientation]].length = 0;
   }
  }
 }
 if (node)
  headings[this.reverse[orientation]].unshift(node);
 node = headings[orientation].shift();
 this.orientation = orientation;
 this.headings = headings;
 if (!node) {
  print("traverse(" + this.ENGLISH[orientation] + "): null\n");
  this.nextElementIsNull = true;
  return null;
 }
 print("traverse(" + this.ENGLISH[orientation] + "): " + (node ? node.toString() : "null") + "\n");
 this.focussedElement = node;
 return node;
},
getNodesAroundPoint: function SpatialNavigator_getNodesAroundPoint(originX, originY, range, limit) {
 var found = [];
 
 var parent;
 var current;
 var minX = originX - range;
 var maxX = originX + range;
 var minY = originY - range;
 var maxY = originY + range;
 while ((parent = toInspect.shift())) {
 for (var x = 0; x < parent.children.length; ++x) {
  if (!(current = parent.children[x]))
   continue;
  if (minX > MyNode.prototype.getRight(current) ||
      maxX < MyNode.prototype.getLeft(current) ||
      minY > MyNode.prototype.getBottom(current) ||
      maxY < MyNode.prototype.getTop(current))
   continue;
  if (current instanceof QTree)
   toInspect.push(current);
  else
   found.push(current);
 }
 }
 this.removeDuplicates(found);
 return found;
},
getNodesInRangeOfPoint: function SpatialNavigator_getNodesInRangeOfPoint(originX, originY, minimumDistance, maximumDistance) {
 var found = [];
 var range = (maximumDistance - minimumDistance) / 2;
 var offset = range + minimumDistance;
 for (var x = -1 ; x <= 1; ++x) {
  for (var y = -1 ; y <= 1; ++y) {
   if (x || y) {
    this.concat(found, this.getNodesAroundPoint(originX + x * offset, originY + y * offset, range));
   }
  }
 }
 this.removeDuplicates(found);
 return found;
},
getPathsAwayFromNode: function SpatialNavigator_getPathsAwayFromNode(currentNode, range) {
 var left = [];
 var right = [];
 var up = [];
 var down = [];
 var nodes = this.getNodesAroundPoint(MyNode.prototype.getLeft(currentNode), MyNode.prototype.getTop(currentNode), range);
 for (var i = 0; i < nodes.length; ++i) {
  var node = nodes[i];
  if (node == currentNode)
   continue;
  if (MyNode.prototype.getRight(currentNode) <= MyNode.prototype.getLeft(currentNode) &&
      MyNode.prototype.getBottom(currentNode) <= MyNode.prototype.getTop(currentNode)) {
   var x = MyNode.prototype.getLeft(currentNode) - MyNode.prototype.getRight(currentNode);
   var y = MyNode.prototype.getTop(currentNode) - MyNode.prototype.getBottom(currentNode);
   if (x > y)
    left.push(node);
   else   
    up.push(node);
   continue;
  }
  if (MyNode.prototype.getLeft(node) >= MyNode.prototype.getRight(currentNode) &&
      MyNode.prototype.getBottom(node) <= MyNode.prototype.getTop(currentNode)) {
   var x = MyNode.prototype.getLeft(node) - MyNode.prototype.getRight(currentNode);
   var y = MyNode.prototype.getTop(currentNode) - MyNode.prototype.getBottom(node);
   if (x > y)
    right.push(node);
   else   
    up.push(node);
   continue;
  }
  if (MyNode.prototype.getRight(node) <= MyNode.prototype.getLeft(currentNode) &&
      MyNode.prototype.getTop(node) >= MyNode.prototype.getBottom(currentNode)) {
   var x = MyNode.prototype.getLeft(currentNode) - MyNode.prototype.getRight(node);
   var y = MyNode.prototype.getTop(node) - MyNode.prototype.getBottom(currentNode);
   if (x > y)
    left.push(node);
   else
    down.push(node);
   continue;
  }
  if (MyNode.prototype.getLeft(node) >= MyNode.prototype.getRight(currentNode) &&
      MyNode.prototype.getTop(node) >= MyNode.prototype.getBottom(currentNode)) {
   var x = MyNode.prototype.getLeft(node) - MyNode.prototype.getRight(currentNode);
   var y = MyNode.prototype.getTop(node) - MyNode.prototype.getBottom(currentNode);
   if (x > y)
    right.push(node);
   else
    down.push(node);
   continue;
  }
  if ((MyNode.prototype.getTop(currentNode) <= MyNode.prototype.getBottom(node) &&
       MyNode.prototype.getTop(currentNode) >= MyNode.prototype.getTop(node)) ||
    (MyNode.prototype.getBottom(currentNode) <= MyNode.prototype.getBottom(node) &&
     MyNode.prototype.getBottom(currentNode) >= MyNode.prototype.getTop(node))) {
   if (MyNode.prototype.getRight(node) <= MyNode.prototype.getLeft(currentNode)) {
    left.push(node);
   }   
   else {
    right.push(node);
   }
   continue;
  }
  if ((MyNode.prototype.getLeft(currentNode) <= MyNode.prototype.getRight(node) &&
       MyNode.prototype.getLeft(currentNode) >= MyNode.prototype.getLeft(node)) ||
    (MyNode.prototype.getRight(currentNode) <= MyNode.prototype.getRight(node) &&
     MyNode.prototype.getRight(currentNode) >= MyNode.prototype.getLeft(node))) {
   if (MyNode.prototype.getBottom(node) <= MyNode.prototype.getTop(currentNode)) {
    up.push(node);
   }
   else {
    down.push(node);
   }
   continue;
  }
 }
/* this should describe cardinals */
 var directions = [ right,
                    up,
                    left,
                    down
                  ];
 return directions;
},
/* nsIWebProgressListener */
onProgressChange: function () {},
onStateChange: function onStateChange(wp, req, flags, status) {
 if (flags & (Components.interfaces.nsIWebProgressListener.STATE_STOP |
              Components.interfaces.nsIWebProgressListener.STATE_IS_WINDOW)) {
  if (wp.DOMWindow == this.mTopWindow ||
      wp.DOMWindow == this.mTopWindow.content)
   this.visualRange = null;
 }
},
onLocationChange: function () {},
onStatusChange: function () {},
onSecurityChange: function () {},
availableNodes: null,
visualRange: null,
visualRangeInitializedTime: undefined
}
function testWalk(map, reachedNodes, reachableNodes, node) {
 if (!reachableNodes) {
  map={};
  reachableNodes=[];
  testWalk(map, reachedNodes, reachableNodes, sn.visualRange);
  reachedNodes=[];
  map={};
 } else if (!reachedNodes) {
  var objectId, child;
  for (var i = 0; i < node.children.length; ++i) {
   if (!(child = node.children[i])) continue;
   if (child instanceof QTree) {
    testWalk(map, reachedNodes, reachableNodes, child);
   } else if (!((objectId = child.objectId) in map)) {
    map[objectId] = child;
    reachableNodes[reachableNodes.length] = child;
   }
  }
  return null;
 }
 if (!node) {
  map[null] = {node: null, objectId: null};
  for (var direction = sn.EAST; direction <= sn.SOUTH; ++direction) {
   node = sn.insertFocus(direction)
   var vector = [node];
   vector.direction = direction;
   map[null][direction] = vector;
   if (node) {
    if (node.objectId in map) {
     continue;
    }
    testWalk(map, reachedNodes, reachableNodes, node);
   }
  }
  return {
   map: map,
   reachedNodes: reachedNodes,
   reachableNodes: reachableNodes,
   toString: function map_toString() {
    var x = "";
    for (var nodeId in this.map) {
        for (var direction = 0; direction < 4; ++direction) {
            var vector = this.map[nodeId][direction];
            if (!vector || !vector.length || !vector[0])
                continue;
            x += nodeId + "\t"+ISpatialNavigation.prototype.ENGLISH[direction]+"\t";
            for (var a = 0; a < 3; ++a) {
                var node = vector[a];
                x += (node ? node.objectId : "null") + "\t";
            }
            x += "\n";
        }
    }
    return x;
   }
  };
 }
 map[node.objectId] = {node: node};
/* walk 3 east, undo. walk 3 west, undo, walk 3 south, undo, walk 3 north
 * if it can only walk 2 east and traverse returns null, then undo means walking 2 west.
 * note that temporarily traverse will do the wrong thing (currently it returns null and nulls out focussedElement,
 * when fixed, it will return null but only null out the focussedElement if asked to repeat that task).
 */
 for (var direction = sn.EAST; direction <= sn.SOUTH; ++direction) {
  sn.focussedElement = node;
  map[node.objectId][direction] = [];
  for (var y = 0; y < 3; ++y) {
   child = sn.traverse(direction);
   if (!child) { y = 4; continue; }
   map[node.objectId][direction].push(child);
   if (!(child.objectId in map)) {
    reachableNodes[reachableNodes.length] = child;
    testWalk(map, reachedNodes, reachableNodes, child);
   }
  }
 }
 return null;
}
function walk(root, nodeList) {
 var nodes = nodeList || [];
 for (var x = 0; x < root.children.length; ++x) {
  var node=root.children[x];
  if (node instanceof QTree)
   walk(node, nodes);
  else if (node)
   nodes.push(node);
 }
 if (nodeList)
  return;
 SpatialNavigator.prototype.removeDuplicates(nodes);
 for (x = 0; x < nodes.length; ++x) {
  print (x, nodes[x], sn.getNodesAroundPoint(x.hcenter, x.vcenter, 20).length - 1);
 }
}
function VisualRegion(window, x, y, width, height){
 this.window = window;
 this.x = x || 0;
 this.y = y || 0;
 this.width = width || 800;
 this.height = height || 480;
}
/**/
function SpatialNavigationService() {
 this.mObjects = [];
}
SpatialNavigationService.prototype = {
 constructor:SpatialNavigationService,
 interfaces: [
  Components.interfaces.nsISupports,
  Components.interfaces.nsIObserver,
 ],
 QueryInterface: QI,
 observe: function SpatialNavigationService_observe(data, topic, subject) {
  switch (topic) {
  case "domwindowopened":
   var chromeWindow = data.QueryInterface(Components.interfaces.nsIDOMWindow);
   var sn = new SpatialNavigator(this, chromeWindow);
   this.mObjects[this.mObjects.length] = sn;
   return;
  case "domwindowclosed":
   var chromeWindow = data.QueryInterface(Components.interfaces.nsIDOMWindow);
   var count = this.mObjects.length;
   for (var i = 0 ; i < count; ++i) {
    var sn = this.mObjects[i];
    if (sn.attachedWindow == chromeWindow) {
     sn.shutdown();
     this.mObjects.splice(i, 1);
     return;
    }
   }
   return;
  case "app-startup":
   var windowWatcher = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
   windowWatcher.registerNotification(this);
   var prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);
   prefBranch.addObserver("snav.", this, false);
   var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
   observerService.addObserver(this, "profile-after-change", false);
   return;
  case "profile-after-change":
   prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);
   try {
    this.mEnabled = prefBranch.getBoolPref("snav.enabled");
   } catch (e) {}
   try {
    this.mIgnoreTextFields = prefBranch.getBoolPref("snav.ignoreTextFields");
   } catch (e) {}
   try {
    gDirectionalBias = prefBranch.getIntPref("snav.directionalBias");
    if (gDirectionalBias == 0)
     gDirectionalBias = 1;
   } catch (e) {}
   try {
    this.mDisableJSWhenFocusing = prefBranch.getBoolPref("snav.disableJS");
    gRectFudge = prefBranch.getIntPref("snav.rectFudge");
   } catch (e) {}
   try {
    this.mKeyCodeLeft = prefBranch.getIntPref("snav.keyCode.left");
   } catch (e) {}
   try {
    this.mKeyCodeRight = prefBranch.getIntPref("snav.keyCode.right");
   } catch (e) {}
   try {
    this.mKeyCodeUp = prefBranch.getIntPref("snav.keyCode.up");
   } catch (e) {}
   try {
    this.mKeyCodeDown = prefBranch.getIntPref("snav.keyCode.down");
   } catch (e) {}
   try {
    this.mKeyCodeModifier = prefBranch.getIntPref("snav.keyCode.modifier");
   } catch (e) {}
   return;
  case "nsPref:changed":
   prefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);
   switch (subject) {
   case "snav.enabled":
    try {
     this.mEnabled = prefBranch.getBoolPref("snav.enabled");
    } catch (e) {}
    break;
   case "snav.ignoreTextFields":
    try {
     this.mIgnoreTextFields = prefBranch.getBoolPref("snav.ignoreTextFields");
    } catch (e) {}
    break;
   case "snav.directionalBias":
    try {
     gDirectionalBias = prefBranch.getIntPref("snav.directionalBias");
     if (gDirectionalBias == 0)
      gDirectionalBias = 1;
    } catch (e) {}
    break;
   case "snav.disableJS":
    try {
     this.mDisableJSWhenFocusing = prefBranch.getBoolPref("snav.disableJS");
    gRectFudge = prefBranch.getIntPref("snav.rectFudge");
    } catch (e) {}
    break;
   case "snav.keyCode.left":
    try {
     this.mKeyCodeLeft = prefBranch.getIntPref("snav.keyCode.left");
    } catch (e) {}
    break;
   case "snav.keyCode.right":
    try {
     this.mKeyCodeRight = prefBranch.getIntPref("snav.keyCode.right");
    } catch (e) {}
    break;
   case "snav.keyCode.up":
    try {
     this.mKeyCodeUp = prefBranch.getIntPref("snav.keyCode.up");
    } catch (e) {}
    break;
   case "snav.keyCode.down":
    try {
     this.mKeyCodeDown = prefBranch.getIntPref("snav.keyCode.down");
    } catch (e) {}
    break;
   case "snav.keyCode.modifier":
    try {
     this.mKeyCodeModifier = prefBranch.getIntPref("snav.keyCode.modifier");
    } catch (e) {}
    break;
   }
   return;
  }
 }
}
const NS_CATEGORYMANAGER_CONTRACTID = "@mozilla.org/categorymanager;1";
function spatialNavigationServiceRegistration(aCompMgr, aPath, registryLocation, componentType)
{
  var servman = aCompMgr.QueryInterface(Components.interfaces.nsIServiceManager);
  var catman = servman.getServiceByContractID(NS_CATEGORYMANAGER_CONTRACTID,
                                              Components.interfaces.nsICategoryManager);
  catman.addCategoryEntry("app-startup",
                          this.name,
                          this.contractID,
                          true,
                          true);
}
function spatialNavigationServiceUnregistration(aCompMgr, aPath, registryLocation)
{
  var servman = aCompMgr.QueryInterface(Components.interfaces.nsIServiceManager);
  var catman = servman.getServiceByContractID(NS_CATEGORYMANAGER_CONTRACTID,
                                              Components.interfaces.nsICategoryManager);
  catman.deleteCategoryEntry("app-startup",
                             this.name,
                             true);
}
function QI(iface) {
 for (var i = 0; i < this.interfaces.length; ++i)
  if (iface.equals(this.interfaces[i]))
   return this;
 throw Components.results.NS_ERROR_NO_INTERFACE;
}
function Factory(component) {
 this.component = component;
}
Factory.prototype = {
 constructor: Factory,
 /* nsIClassInfo */
 interfaces: [
  Components.interfaces.nsISupports,
  Components.interfaces.nsIFactory,
 ],
 /* nsISupports */
 QueryInterface: QI,
 /* nsIFactory */
 createInstance: function Factory_createInstance(outer, iid) {
  if (outer)
   throw Components.results.NS_ERROR_NO_AGGREGATION;
   return (new this.component.constructor).QueryInterface(iid);
 }, 
 lockFactory: function Factory_lock(lock) {
   /* no-op */
 }
}
function SpatialNavigationModule(){
 this.initModule();
}
SpatialNavigationModule.prototype = {
 constructor: SpatialNavigationModule,
 /* nsIClassInfo */
 interfaces: [
  Components.interfaces.nsISupports,
  Components.interfaces.nsIModule,
 ],
 /* nsISupports */
 QueryInterface: QI,
 /* nsIModule */
 components: [{
  name: "SpatialNavigationService",
  cid: Components.ID("{3f4bbf92-39d2-4783-bacd-e8d58b02ba4b}"),
  contractID: "@mozilla.org/spatialnavigation/service",
  constructor: SpatialNavigationService,
  register: spatialNavigationServiceRegistration,
  unregister: spatialNavigationServiceUnregistration
 }],
 initModule: function SpatialNavigationModule_initModule() {
  for (var i = 0; i < this.components.length; ++i) {
   this.components[this.components[i].cid] = new Factory(this.components[i]);
  }
 },
 getClassObject: function SpatialNavigationModule_getClassObject(aCompMgr, aClass, aIID) {
  if (!(aClass in this.components))
   throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
  return this.components[aClass].QueryInterface(aIID);
 },
 registerSelf: function SpatialNavigationModule_registerSelf(aCompMgr, aLocation, aLoaderStr, aType) {
  aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  for (var i = 0; i < this.components.length; ++i) {
   var component = this.components[i];
   aCompMgr.registerFactoryLocation(component.cid,
                                    component.name,
                                    component.contractID,
                                    aLocation,
                                    aLoaderStr,
                                    aType);
   if (component.register)
    component.register(aCompMgr, aLocation, aLoaderStr, aType);
  }
 },
 unregisterSelf: function SpatialNavigationModule_unregisterSelf(aCompMgr, aLocation, aLoaderStr) {
  aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  for (var i = 0; i < this.components.length; ++i) {
   var component = this.components[i];
   aCompMgr.unregisterFactoryLocation(component.cid,
                                     aLocation);
   if (component.unregister)
    component.unregister(aCompMgr, aLocation, aLoaderStr);
  }
 },
 canUnload: function SpatialNavigationModule_function(aCompMgr) {
  return true;
 }
};
var module = new SpatialNavigationModule;
function NSGetModule() {
  return module;
}
if (dump && typeof print=="undefined") {
 print = dump;
}
