/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Frame merging.
 *
 * The Initial Developer of the Original Code is
 * Nokia Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
  
(function () {
var always_merge_frames = true;
var non_xul_host = false;
/*
Components.classes["@maemo.org/microb/mergeframes;1"].getService()

This is a draft implementation.

Testcases:
http://viper.haque.net/~timeless/roc.mf/notes.html
- http://viper.haque.net/~timeless/roc.mf/0.html
- http://viper.haque.net/~timeless/roc.mf/1.html

0 is the original test input
notes is the annotated test input describing what should happen
1 is html designed to show how i think we should render 0/notes - this is obviously scaled down.

http://webwizardry.net/~timeless/test/
 this is a pathological case, you can't not have scrollbars here, the middle frame requires them
 that said, the behavior of gecko and opera leaves a lot to be desired

http://www.webwizardry.net/~timeless/t0/
 iframe, just to make sure we haven't changed them

http://www.webwizardry.net/~timeless/r0/
 basic test of frame merging

To use this component:
 copy this file to dist/bin/components and run your engine.

To stop using this component:
 delete the file from dist/bin/compnents and run your engine.

This component does have code to dynamically enable/disable frame merging
per window. But it won't be changed to use it until there's code to call
it, otherwise it would always be willing to dynamically enable frame
merging, but would never do it. That wouldn't help anyone.

Known bugs:
* There seems to be a bit of a miscalculation for window width, so there will be a couple of pixels of whitespace to the right edge.
* The math isn't very good for notes.html, the bottom left frame needs to be very wide but is not.
* Frames that do not dominate in a dimension as the top frames in notes do not horizontally should retain their original page specification
and not be _force_width's. That would allow the top to scale correctly with the bottom forcing the growth. 

These problems are actually tolerably easy to deal with, instead of making changes immediately during frameset traversal,
the code should select what changes it plans to make, and then discard them as it finds places which have a bigger stretch.
*/

function Uneval (o) {
  try {
    return uneval(o);
  } catch (e) {
    return "{/* complicated uneval call threw an exception */}";
  }
}

try {
  Components.ID;
} catch (e) {
  /* stub Components */
  (function (){
    var components=Components;
    Components = {
      ID: function (){return {};},
      interfaces: components.interfaces
    }
  })()
}

/*
 * sugar that emulates dump but includes newlines.
 */
function print() {
  for (var i=0; i < arguments.length; ++i)
    dump(arguments[i]);
  dump("\n");
}

/*
 * Class MicrobMergeFrames
 */
function MicrobMergeFrames() {
  this.domTree = new this.WindowState(null, null);
  var interfaces = this.i;
  if (!("nsISupports" in interfaces)) {
    /* interfaces we use */
    var ifaces = interfaces;
    var i = ifaces.length;
    while (i--) { 
      var iface = ifaces[i];
      interfaces[iface] = iface; 
    }
    if ("nsIWebProgressListener2" in Components.interfaces)
      this.interfaces.push(Components.interfaces.nsIWebProgressListener2);
    /* interfaces we implement */
    ifaces = this.interfaces;
    i = ifaces.length;
    while (i--) { 
      var iface = ifaces[i];
      interfaces[iface] = iface; 
    }    
  }
  var obsSvc = this.services.obsSvc = 
        Components.classes["@mozilla.org/observer-service;1"]
                  .getService(interfaces.nsIObserverService);
  obsSvc.addObserver(this, "maemo-mergeframes", true);
  obsSvc.addObserver(this, "xpcom-shutdown", true);
  var docLoaderSvc = this.services.docLoaderSvc =
        Components.classes["@mozilla.org/docloaderservice;1"]
                  .getService(interfaces.nsIWebProgress);
  docLoaderSvc.addProgressListener(this, interfaces.nsIWebProgress.NOTIFY_ALL);
  this.services.windowWatcherSvc =
        Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                  .getService(interfaces.nsIWindowWatcher);
/*
DOMContentLoaded
*/
}

if (this.dissrc) {
 /* this is support for jsshell */
 this.instanceOf = function instanceOf(obj, type) {
  try {
   if (type instanceof Function)
    return obj instanceof type;
   if (obj.QueryInterface &&
       obj.QueryInterface(type))
    return true;
  } catch (e) {
  }
  return false;
 }
} else {
 this.instanceOf = function instanceOf(obj, type) {
  return obj instanceof type;
 }
}

MicrobMergeFrames.prototype = {
  /* __proto__ */
  constructor: MicrobMergeFrames,
  /* nsISupports */
  QueryInterface: function QueryInterface(iid) {
    var interfaces = this.interfaces;
    var i = interfaces.length;
    while (i--)
      if (iid.equals(interfaces[i]))
        return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
  /* nsIObserver */
  observe: function observe(data, topic, subject) {
    /* these parameters are *not* in the same order as the interface */
    switch (topic) {
    case "xpcom-shutdown":
      this.services.obsSvc.removeObserver(this, "xpcom-shutdown");
      this.services.docLoaderSvc.removeProgressListener(this);

      this.topLevelWindows = null;
      this.domWindows = null;
      // Release Services
      this.services = null;
      break;
    case "maemo-mergeframes":
      var windows = this.topLevelWindows;
      var i = windows.length;
      if (!data) {
        data = this.services.windowWatcherSvc.activeWindow;
      } else {
        var interfaces = this.i;
        if (!(instanceOf(data, interfaces.nsIDOMDocument)) &&
             (instanceOf(data, interfaces.nsIDOMNode)))
          data = data.ownerDocument; 
        if (instanceOf(data, interfaces.nsIDOMDocumentView))
          data = data.defaultView;
        if (instanceOf(data, interfaces.nsIDOMWindow))
          data = this.getRootWindow(data);
      }

      switch (subject) {
      case "enable":
        if (!this.addToList(data, windows))
          return;
        this.registerDOMlistener(data);
        this.updateWindow(data, true);
        break;
      case "disable":
        var found = this.removeFromList(data, windows);
        if (found)
          this.updateWindow(data, false);
        break;
      default:
      } 
      break;
    }
  },
  /* nsIClassInfo */
  getInterfaces: function getInterfaces(length) {
    length.value = this.interfaces.length;
    return this.interfaces;
  },
  /* nsIClassInfo */
  getHelperForLanguage: function getHelperForLanguage(language) {
    return null;
  },
  /* nsIClassInfo */
  contractID: "@maemo.org/microb/mergeframes;1",
  /* nsIClassInfo */
  classDescription: "Merge Frames",
  /* nsIClassInfo */
  classID: Components.ID("{91959328-9840-4cb6-ba33-a79d2cb412bd}"),
  /* nsIClassInfo */
  implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
  /* nsIClassInfo */
  flags:
    Components.interfaces.nsIClassInfo.THREADSAFE |
    Components.interfaces.nsIClassInfo.SINGLETON |
    Components.interfaces.nsIClassInfo.EAGER_CLASSINFO |
    0,
  /* nsIWebProgressListener */
  onStateChange: function onStateChange(
    /*in nsIWebProgress*/ aWebProgress,
    /*in nsIRequest*/ aRequest,
    /*in unsigned long*/ aStateFlags,
    /*in nsresult*/ aStatus) {
    try {
      var window = aWebProgress.DOMWindow;
    } catch (e) {
      return;
    }
    if (!window)
      return;
    if (instanceOf(window, Components.interfaces.nsIDOMChromeWindow))
      return;
    var windows = this.topLevelWindows;
    var rootWindow = this.getRootWindow(window);
    if (!this.isListed(rootWindow, windows))
{
if (always_merge_frames) {
  print("test hook registering");
  this.observe(rootWindow, "maemo-mergeframes", "enable");
} else {
      return;
}
}
    const nsIWebProgressListener = this.i.nsIWebProgressListener;
    const STATE_START = nsIWebProgressListener.STATE_START;
    const STATE_STOP = nsIWebProgressListener.STATE_STOP;
var flags=": "+aStateFlags.toString(16);
    if (aStateFlags & STATE_START) {
//print("STATE_START"+flags);
      window.addEventListener("DOMContentLoaded", this, true);
    } else if (aStateFlags & STATE_STOP) {
//print("STATE_STOP"+flags);
    } else {
//print("hello world "+flags);
    }
  },
  /* nsIWebProgressListener */
  onProgressChange: function onProgressChange(
    /*in nsIWebProgress*/ aWebProgress,
    /*in nsIRequest*/ aRequest,
    /*in long*/ aCurSelfProgress,
    /*in long*/ aMaxSelfProgress,
    /*in long*/ aCurTotalProgress,
    /*in long*/ aMaxTotalProgress) {
  },
  /* nsIWebProgressListener */
  onLocationChange:function onLocationChange(
    /*in nsIWebProgress*/ aWebProgress,
    /*in nsIRequest*/ aRequest,
    /*in nsIURI*/ aLocation) {
  },
  /* nsIWebProgressListener */
  onStatusChange: function onStatusChange(
    /*in nsIWebProgress*/ aWebProgress,
    /*in nsIRequest*/ aRequest,
    /*in nsresult*/ aStatus,
    /*in wstring*/ aMessage) {
  },
  /* nsIWebProgressListener */
  onSecurityChange: function onSecurityChange(
    /*in nsIWebProgress aWebProgress,
    /*in nsIRequest*/ aRequest,
    /*in unsigned long*/ aState) {
  },
  /* nsIWebProgressListener2 */
  onProgressChange64: function onProgressChange64(
    /*in nsIWebProgress*/ aWebProgress,
    /*in nsIRequest*/ aRequest,
    /*in long long*/ aCurSelfProgress,
    /*in long long*/ aMaxSelfProgress,
    /*in long long*/ aCurTotalProgress,
    /*in long long*/ aMaxTotalProgress) {
  },
  /* nsIDOMEventListener */
  handleEvent: function handleEvent(event) {
    dump(event.type+": "+event.target+" @ "+event.target.location.href.replace(/^.*\//,''));
    switch (event.type) {
    case "unload":
      this.removeFromList(event.target, this.domWindows);
      var state = this.build_state(event.target.defaultView);
      var tree_level = this.domTree;
      for (var depth = 0; depth < state.length; depth++) {
        var children = tree_level.children;
        for (var i = 0;
             i < children.length;
             ++i) {
          if (tree_level.children[i].window == state[depth].window) {
            if (depth < state.length - 1)
              tree_level = tree_level.children[i];
            else {
              tree_level.children.splice(i,1);
              tree_level.loaded.splice(i,1);
              tree_level.listeners.splice(i,1);
            }
            break;
          }
        }
      }
      break;
    case "load":
      var document = event.target;
      if (!document) {
print("aiee no document");
        return;
      }
      var window = document.defaultView;
      this.update_state(window, true);
      break;
    case "DOMContentLoaded":
      var document = event.target;
      if (!document) {
print("aiee no document");
        return;
      }
      if (!this.addToList(document.defaultView, this.domWindows))
        this.registerDOMloadListener(document.defaultView);
      break;
    default:
    }
    print();
  },
  documentIsXML: function documentIsXML(document) {
    return instanceOf(document, Components.interfaces.nsIDOMXMLDocument);
  },
  getFramesets: function getFramesets(document) {
    return this.documentIsXML(document)
           ? document.getElementsByTagNameNS(this.XHTML_NAMESPACE, "frameset")
           : document.getElementsByTagName("frameset");
  },
  /* private */
  calculateFrames: function calculateFrames(document) {
print("cF");
      var interfaces = this.i;
      var Node = interfaces.nsIDOMNode;
      var Frameset = interfaces.nsIDOMHTMLFrameSetElement;
      var Frame = interfaces.nsIDOMHTMLFrameElement;
      var ELEMENT_NODE = Node.ELEMENT_NODE;
    var framesets = this.getFramesets(document);
    var i = framesets.length;
    var frameList = { framesets: [], widths: [], heights: [] };
    while (i--) {
print("cF["+i+"] "+document+" "+document.location.href.substring(-10,30));
      var frameset = framesets[i];
/* XXX some inputs are really painful
 *
 * <frameset rows="20 5,*" cols="*,*"></frameset>
 * <frameset rows="20%,*" cols="*,*"></frameset>
 * <frameset rows="20 50,*" cols="*,*"></frameset>
 *
 * thankfully we don't actually care.
 */

/*
reminder:
widths=array of widths, first cell is the minimum width for that column
the number of elements in the widths array is equal to the number of cols
 */
      var widths = null, heights = null, framesetRows = '', framesetCols = '';
      if (frameset.hasAttribute("rows"))
        framesetRows = frameset.getAttribute("rows");
      heights = new Array(framesetRows.split(/,/).length);
      if (frameset.hasAttribute("cols"))
        framesetCols = frameset.getAttribute("cols");
      widths = new Array(framesetCols.split(/,/).length);
        for (x = 0; x < widths.length; ++x)
          widths[x] = [];
        for (y = 0; y < heights.length; ++y)
          heights[y] = [];
      var x = 0;
      var y = 0;
      for (var node = frameset.firstChild; node; node = node.nextSibling) {
print("fsR: "+framesetRows+" fsC: "+framesetCols+
" widths("+typeof widths+"): "+Uneval(widths)+
" heights("+typeof heights+"): "+Uneval(heights)+"("+x+","+y+")");
        if (instanceOf(node, Frameset)) {
          var framesets = frameList.framesets
          var framesetWidth = [0];
          var framesetHeight = [0];
          for (var j = framesets.length; j--; ) {
            if (node === framesets[j]) {
              framesetHeight = frameList.heights[j];
              framesetWidth = frameList.widths[j];
              break;
            }
          }
          heights[y].push(Math.max.apply(null,framesetHeight));
          widths[x].push(Math.max.apply(null,framesetWidth));
        } else if (instanceOf(node, Frame)) {
          var localDocument = node.contentDocument.documentElement;
            heights[y].push(localDocument.clientHeight);
            widths[x].push(localDocument.clientWidth);
        } else
          continue;
        if (++x == widths.length) {
print("col>row shift");
          x = 0; ++y;
        }
      }
        for (x = 0; x < widths.length; ++x)
          widths[x] = Math.max.apply(null,widths[x]);
        for (y = 0; y < heights.length; ++y) {
          heights[y] = Math.max.apply(null,heights[y]);
          //if (heights[y] < 1000) heights[y] = 1000;
        }
      var backup = {};
if (!frameset.hasAttribute("_force_width") &&
    !frameset.hasAttribute("_force_height")) {
			frameset.setAttribute("_force_width", "true");
			frameset.setAttribute("_force_height", "true");
      if (frameset.hasAttribute("border"))
        backup.border = frameset.getAttribute("border");
      if (frameset.hasAttribute("scrolling"))
        backup.scrolling = frameset.getAttribute("scrolling");
      if (frameset.hasAttribute("padding"))
        backup.padding = frameset.getAttribute("padding");
      frameset.setAttribute("border", "0");
      frameset.setAttribute("scrolling", "no");
      frameset.setAttribute("padding", "1");
function scalePxToTwips(ary, scale)
{
var i;
var str = "";
for (i = 0; (i < ary.length); ++i) {
if (str) str += ",";
str += ary[i] * 15;
}
print("scalePxToTwips("+ary.join(",")+" => "+str+")");
return str;
}
      if (framesetRows) {
        backup.rows = frameset.getAttribute("rows");
print("changing frameset "+frameset+" rows from "+backup.rows+" to "+heights.join(","));
        frameset.setAttribute("rows", heights.join(","));
      }
      if (framesetCols) {
        backup.cols = frameset.getAttribute("cols");
print("changing frameset "+frameset+" cols from "+backup.cols+" to "+widths.join(","));
        frameset.setAttribute("cols", widths.join(","));
      }
      frameset.setAttribute("_before_",Uneval(backup));
}
      frameList.framesets.push(frameset);
      frameList.widths.push(widths);
      frameList.heights.push(heights);
print(Uneval(frameList));
      document = frameset.ownerDocument;
      if (!this.get_parent(document.defaultView))
        document.documentElement.style.overflow = "auto";
    }
    
  },
  /* private */
/*
 * this uses xpcom to get the real parent
 * this function will return null if it runs out of parents
 *
 * @return null if there's no window,
 *              or it is a chrome window,
 *              or it's closed
 *              or there's no parent of the same type
 * @return nsIDOMWindow that's the parent of the window
 */
get_parent:
function get_parent(window)
{
  if (!window)
    return null;
  if (instanceOf(window, Components.interfaces.nsIDOMChromeWindow))
    return null;
  if (window.closed)
    return null;
  var webNav = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIWebNavigation);
  webNav = webNav
               .QueryInterface(Components.interfaces.nsIDocShellTreeItem);
  var parent = webNav
               .sameTypeParent;
  if (!parent)
    return null;
  return parent.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIDOMWindow);
},

/*
 * the individual state objects here will be used in world
 * @param window to plot branch pattern to root
 * @return array of windows, parent pointers 
 */
build_state:
function build_state(window)
{
  var state_chain = [];
  do 
  {
    var parent = this.get_parent(window);
    state_chain.unshift(new this.WindowState(window, parent));
    window = parent;
  } while (parent);
  return state_chain;
},
WindowState: function WindowState(window, parent) {
    /* window is the represented window in the dom window tree hierarchy
     * parent is the parent of the window
     * children is a list of known children kept in pairwise sync with loaded 
     * loaded is an array of loaded status flags corresponding to windows described in children
     * listeners is a dirty placeholder to remind us that something should probably pay attention to windows dying and being replaced
     */
  this.window = window;
  this.parent = parent;
  this.children = [];
  this.loaded = [];
  this.listeners = [];
  this.subtreeLoaded = false;
},
/*
 * this is a tree
 */
domTree: null,

/*
 * phase 1: build an array of frame descriptors from the root to the window
 * phase 2: determine if all siblings of a frame at each depth along the branch path from 1 is loaded
 * phase 2.1: mark status on selected state window
 * phase 3: fire any resize_frame calls starting with the deepest node and working out, for all nodes
 *          that transitioned from not loaded to loaded
 *
 */
update_state:
function update_state(window, status)
{
  /* phase 1 */
  var state = this.build_state(window);
  var indices = [];
  var ready = [];
  var tree_level = this.domTree;
  /* phase 2 */
  for (var depth = 0; depth < state.length; ++depth) {
    var children = tree_level.children;
    var loaded = tree_level.loaded;
    var selected_frame = state[depth];
print("depth: "+depth+"<Ready: "+Uneval(ready));
    ready[depth] = 0;
print("depth: "+depth+">Ready: "+Uneval(ready));
    tree_level = selected_frame;
    for (var i = 0;
         i < children.length;
         ++i) {
      if (depth > 0) {
        /* we want to know if a level now has all of its children loaded */
print("i: "+i+
" depth: "+depth+
" ready: "+Uneval(ready)+
" ready[depth]: "+ready[depth]+
" children[i]: "+Uneval(children[i])+
" children[i].subtreeLoaded: "+(children[i] ? children[i].subtreeLoaded : 'undef'));
        if (!(depth in ready)) {
          print("no ready[depth] @ depth = "+depth);
          ready[depth] = 0;
        }
print("Ready: "+Uneval(ready));
        ready[depth] += (loaded[i] && children[i].subtreeLoaded) || 0;
print("! ready[depth]: "+ready[depth]);
      }
      /* if we found the child we seek, then we discard our pointer and
       * adopt the real object. */
      if (children[i].window == selected_frame.window) {
        tree_level = children[i];
      }
    }

    /* if we didn't find this window, we'll just add it to the end of the list */
    if (tree_level == selected_frame)
      children.push(selected_frame);
    indices.push(i);
  }
  /* order of operations matter here. we're only updating the deepest child */
print("status: "+status+
" depth: "+depth+
" ready: "+Uneval(ready)+
" ready[depth]: "+ready[depth]+
" tree_level.loaded: "+Uneval(tree_level.loaded)+
" tree_level.loaded[i]: "+(tree_level.loaded ? tree_level.loaded[i] : 'undef')+
" selected_frame.subtreeLoaded: "+(selected_frame ? selected_frame.subtreeLoaded : 'undef'));
  if (!(depth in ready)) {
    print("no ready[depth] @ depth = "+depth);
    ready[depth] = 0;
  }
  if (tree_level.loaded[i] != status) {
    tree_level.loaded[i] = status;
    if (status) {
      selected_frame.subtreeLoaded |= !this.getFramesets(selected_frame.window.document).length;
      ready[depth] += selected_frame.subtreeLoaded;
    }
  }
print("tree_level.loaded[i]: "+tree_level.loaded[i]);
print("! ready[depth]: "+ready[depth]);

  var carry = true;

print("update_state 3");
  /* phase 3 */
  while (depth > 1) {
print("depth: "+depth+
" ready[depth]: "+ready[depth]+
" carry: "+carry+
" children.length: "+children.length);
    if (ready[depth] + !carry == children.length) {
print("this.calculateFrames(selected_frame.window.document);");
      this.calculateFrames(selected_frame.window.document);
      carry = selected_frame.subtreeLoaded;
      selected_frame.subtreeLoaded = true;
      selected_frame = selected_frame.parent;
      --depth;
    } else {
      depth = 1;
    }
    --depth;
  }
},

  removeFromList: function removeFromList(item, list) {
    var i = list.length;
    while (i--)
      if (list[i] === item) {
        list.splice(i, 1);
        return true;
      }
    return false;
  },
  addToList: function addToList(item, list) {
    if (this.isListed(item, list))
      return false;
    list.push(item);
    return true;
  },
  isListed: function isListed(item, list) {
    var i = list.length;
    var found;
    while (i--) {
      if (list[i] === item) {
        found = true;
      }
    }
//    print("isListed: "+found);
    return found;
  },
  /* private*/
  getRootWindow: function getRootWindow(window) {
    var interfaces = this.i;
    try {
      var root = window.QueryInterface(interfaces.nsIInterfaceRequestor)
                       .getInterface(interfaces.nsIWebNavigation)
                       .QueryInterface(interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(interfaces.nsIInterfaceRequestor)
                       .getInterface(interfaces.nsIDOMWindow);
    } catch (e) {
    }
    return root;
  },
  /* private */
  registerDOMlistener: function registerDOMlistener(window) {
    window.document.addEventListener("DOMContentLoaded", this, true);
  },
  registerDOMloadListener: function registerDOMloadListener(window) {
    window.addEventListener("load", this, false);
    window.addEventListener("unload", this, false);
    this.update_state(window, false);
  },
  /* private */
  updateWindow: function updateWindow(window, mergeFrames) {
    if (mergeFrames) {
      this.calculateFrames(window.document);
    } else {
      print("not implemented");
    }
  },
  /* list of well known interfaces we implement */
  interfaces: [
    /* everyone implements this */
    Components.interfaces.nsISupports,
    /* needed by nsIWebProgress.addProgressListener */
    Components.interfaces.nsISupportsWeakReference,
    /* needed by nsIObserverService.addObserver */
    Components.interfaces.nsIObserver,
    /* needed by nsIDOMEventHandler.addEventListener */
    Components.interfaces.nsIDOMEventListener,
    /* needed by nsIWebProgress.addProgressListener */
    Components.interfaces.nsIWebProgressListener,
    /* not needed at all */
    /* // This interface doesn't always exist
    Components.interfaces.nsIWebProgressListener2,
    */
    /* makes sugar */
    Components.interfaces.nsIClassInfo,
  ],
  /* sugar list of interfaces we use */
  i: [
    Components.interfaces.nsIDocShellTreeItem,
    Components.interfaces.nsIDOMHTMLFrameSetElement,
    Components.interfaces.nsIDOMHTMLFrameElement,
    Components.interfaces.nsIDOMDocument,
    Components.interfaces.nsIDOMDocumentView,
    Components.interfaces.nsIDOMNode,
    Components.interfaces.nsIDOMWindow,
    Components.interfaces.nsIDOMXMLDocument,
    Components.interfaces.nsIInterfaceRequestor,
    Components.interfaces.nsIObserverService,
    Components.interfaces.nsIWebNavigation,
    Components.interfaces.nsIWebProgress,
    Components.interfaces.nsIWindowWatcher,
  ],
  /* xhtml namespace */
  XHTML_NAMESPACE: "http://www.w3.org/1999/xhtml",
  domWindows: [],
  topLevelWindows: [],
  events: [
    "DOMContentLoaded",
  ],
  services: {}
}

function MicroMergeFramesFactory(){}
MicroMergeFramesFactory.prototype = {
  constructor: MicroMergeFramesFactory,
  // createInstance: Return a new MicrobMergeFrames object.
  createInstance: function createInstance(outer, iid) {
    if (outer != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;

    return (new MicrobMergeFrames).QueryInterface(iid);
  }
};

// This Component's module implementation.  All the code below is used to get this
// component registered and accessible via XPCOM.
function FrameMergingModule(){}
FrameMergingModule.prototype = {
  constructor: FrameMergingModule,
  firstTime: true,

  // registerSelf: Register this component.
  registerSelf: function registerSelf(compMgr, fileSpec, location, type) {
    if (this.firstTime) {
      this.firstTime = false;
      throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    }
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(this.cid,
                                    this.className,
                                    this.contractId,
                                    fileSpec,
                                    location,
                                    type);
    var categoryManager = Components.classes["@mozilla.org/categorymanager;1"]
                                    .getService(Components.interfaces.nsICategoryManager);
    categoryManager.addCategoryEntry("app-startup",
                                     this.className,
                                     "service,"+this.contractId,
                                     true,
                                     true);
  },

  unregisterSelf: function unregisterSelf(compMgr, location, type) {
    dump("module.unregisterSelf");
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(this.cid,
                                      location);
    var categoryManager = Components.classes["@mozilla.org/categorymanager;1"]
                                    .getService(Components.interfaces.nsICategoryManager);
    categoryManager.deleteCategoryEntry("app-startup",
                                        this.className);
  },

  // getClassObject: Return this component's factory object.
  getClassObject: function getClassObject(compMgr, cid, iid) {
    if (!iid.equals(Components.interfaces.nsIFactory) &&
        !iid.equals(Components.interfaces.nsISupports)) {
      throw Components.results.NS_ERROR_NO_INTERFACE;
    }

    if (!cid.equals(this.cid)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    }

    return this.factory;
  },

  /* CID for this class */
  cid: Components.ID("{91959328-9840-4cb6-ba33-a79d2cb412bd}"),

  /* className */
  className: "Merge Frames",
 
  /* Contract ID for this class */
  contractId: "@maemo.org/microb/mergeframes;1",

  /* factory object */
  factory: new MicroMergeFramesFactory,

  // canUnload: n/a (returns true)
  canUnload: function(compMgr) {
    return true;
  }
};

var module;

// NSGetModule: Return the nsIModule object.
this.NSGetModule = function NSGetModule(compMgr, fileSpec) {
  if (!module) module = new FrameMergingModule;
  return module;
}
})()
