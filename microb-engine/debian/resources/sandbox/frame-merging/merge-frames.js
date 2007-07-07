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
function print() {
  for (var i=0; i < arguments.length; ++i)
    dump(arguments[i]);
  dump("\n");
}
function mbMergeFrames() {
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

mbMergeFrames.prototype = {
  /* __proto__ */
  constructor: mbMergeFrames,
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
    var obsSvc = this.services.obsSvc;
    switch (topic) {
    case "xpcom-shutdown":
      obsSvc.removeObserver(this, "xpcom-shutdown");
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
        if (!(data instanceof interfaces.nsIDOMDocument) &&
             (data instanceof interfaces.nsIDOMNode))
          data = data.ownerDocument; 
        if (data instanceof interfaces.nsIDOMDocumentView)
          data = data.defaultView;
        if (data instanceof interfaces.nsIDOMWindow)
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
    var windows = this.topLevelWindows;
    var rootWindow = this.getRootWindow(window);
    if (!this.isListed(rootWindow, windows))
{
if (0) {
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
      window.addEventListener("DOMContentLoaded", this, true); /* needed for non xul host  */
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
    dump(event.type+": "+event.target);
    switch (event.type) {
    case "unload":
      this.removeFromList(event.target, this.domWindows);
      break;
    case "load":
dump(event.target.location.href.substring(0,30));
      var document = event.target;
      if (!document) {
print("aiee no document");
        return;
      }
      this.calculateFrames(document);
      var window = document.defaultView;
      
      if (0) {/* non xul hosts don't like this */
        if (window.top == window)
          document.documentElement.style.overflow = "auto";
      }
      break;
    case "DOMContentLoaded":
dump(event.target.location.href.substring(0,30));
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
  /* private */
  calculateFrames: function calculateFrames(document) {
      var interfaces = this.i;
      var Node = interfaces.nsIDOMNode;
      var Frameset = interfaces.nsIDOMHTMLFrameSetElement;
      var Frame = interfaces.nsIDOMHTMLFrameElement;
      var ELEMENT_NODE = Node.ELEMENT_NODE;
    var isXML = false;
    var framesets =
          isXML
           ? document.getElementsByTagNameNS(this.XHTML_NAMESPACE, "frameset")
           : document.getElementsByTagName("frameset");
    var i = framesets.length;
    var world = { framesets: [], widths: [], heights: [] };
    while (i--) {
print("cF["+i+"] "+document+" "+document.location.href.substring(0,30));
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
                                                                   " widths("+typeof widths+"): "+uneval(widths)+
                                                                   " heights("+typeof heights+"): "+uneval(heights)+"("+x+","+y+")");
        if (node instanceof Frameset) {
          var framesets = world.framesets
          var framesetWidth = [0];
          var framesetHeight = [0];
          for (var j = framesets.length; j--; ) {
            if (node === framesets[j]) {
              framesetHeight = world.heights[j];
              framesetWidth = world.widths[j];
              break;
            }
          }
          heights[y].push(Math.max.apply(null,framesetHeight));
          widths[x].push(Math.max.apply(null,framesetWidth));
        } else if (node instanceof Frame) {
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
      frameset.setAttribute("_before_",uneval(backup));
}
      world.framesets.push(frameset);
      world.widths.push(widths);
      world.heights.push(heights);
print(uneval(world));
    }
    
  },
  /* private */
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
    Components.interfaces.nsIDOMDocument,
    Components.interfaces.nsIDOMDocumentView,
    Components.interfaces.nsIDOMNode,
    Components.interfaces.nsIDOMHTMLFrameSetElement,
    Components.interfaces.nsIDOMHTMLFrameElement,
    Components.interfaces.nsIDOMWindow,
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

// This Component's module implementation.  All the code below is used to get this
// component registered and accessible via XPCOM.
var module = {
  firstTime: true,

  // registerSelf: Register this component.
  registerSelf: function (compMgr, fileSpec, location, type) {
    print("module.registerSelf");
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

  unregisterSelf: function (compMgr, location, type) {
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
  getClassObject: function (compMgr, cid, iid) {
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
  factory: {
    // createInstance: Return a new mbMergeFrames object.
    createInstance: function (outer, iid) {
      if (outer != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;

      return (new mbMergeFrames).QueryInterface(iid);
    }
  },

  // canUnload: n/a (returns true)
  canUnload: function(compMgr) {
    return true;
  }
};

// NSGetModule: Return the nsIModule object.
function NSGetModule(compMgr, fileSpec) {
  return module;
}
