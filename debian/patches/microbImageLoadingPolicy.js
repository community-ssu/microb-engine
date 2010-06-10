const C = Components;
const Cr = C.results;
const Cc = C.classes;
const Ci = C.interfaces;
const CONTRACT_ID = "@browser.garage.maemo.org/microb-image-loading-policy;1";
const CLASS_ID = Components.ID("{fca94af9-ab25-4634-9f2e-cfcf44d696ee}");
const ACCEPT = Ci.nsIContentPolicy.ACCEPT;
const REJECT = Ci.nsIContentPolicy.REJECT_REQUEST;

function isCached(url) {
 cs=Cc["@mozilla.org/network/cache-service;1"].getService(Ci.nsICacheService);
 s=cs.createSession("HTTP",Ci.nsICache.STORE_ANYWHERE,true);
 s.doomEntriesIfExpired=false;
 try {
  s.openCacheEntry(url,Ci.nsICache.ACCESS_READ,false);
  return true;
 } catch (e) {}
 return false;
}

function stripOddSchemes(url) {
 if (!url)
  return null;
 var newUrl = url;
 do {
  url = newUrl;
  newUrl = newUrl.replace(/^view-source:/, "")
                 .replace(/^wyciwyg:\/\/\d+\//, "");
  if (/^jar:(.*)!/.test(newUrl))
   newUrl = RegExp.$1;
 } while (newUrl != url);
 return Cc["@mozilla.org/network/io-service;1"]
         .newURI(newUrl, null, null);
}

function ContentPolicy() {
 this.mPrefs = Cc["@mozilla.org/preferences-service;1"]
                .getService(Ci.nsIPrefBranchInternal);
 this.mPrefs instanceof Ci.nsIPrefBranch;
 // XXX this leaks, you need to register a shutdown observer
 //     and unregister yourself there ...
 this.mPrefs.addObserver("microb.download_images", this, false);
 try {
  this.mDownloadImages = this.mPrefs.getBoolPref("microb.download_images");
 } catch (e) {
  this.mDownloadImages = true;
 }
}

ContentPolicy.prototype = {
 shouldLoad: function shouldLoad(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
  if (!aContext)
   return ACCEPT;
  try {
   aContentLocation = stripOddSchemes(aContentLocation.spec);
  } catch (e) {}
  if (this.mDownloadImages)
   return ACCEPT;
  if (!/https?/.test(aContentLocation.scheme))
   return ACCEPT;
  if (aContentType != Ci.nsIContentPolicy.TYPE_IMAGE)
   return ACCEPT;
  if (isCached(aContentLocation.spec))
   return ACCEPT;
  return REJECT;
 },
 shouldProcess: function shouldProcess(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
  return ACCEPT;
 },
 observe: function observe(subject, topic, data)
 {
  if (topic != "nsPref:changed")
   return;
  switch (data) {
   case "microb.download_images":
    try {
     this.mDownloadImages = this.mPrefs.getBoolPref("microb.download_images");
    } catch (e) {
     this.mDownloadImages = true;
    }
    break;
  }
 }
}

var ContentPolicyInstance = null;
const factory = {
 createInstance: function(outer, iid) {
  if (outer)
   throw Cr.NS_ERROR_NO_AGGREGATION;
  if (!iid.equals(Ci.nsIContentPolicy) &&
      !iid.equals(Ci.nsISupports)) {
   throw Cr.NS_ERROR_NO_INTERFACE;          
  }
  if (!ContentPolicyInstance)
   ContentPolicyInstance = new ContentPolicy();
  return ContentPolicyInstance;
 },
 // nsISupports interface implementation
 QueryInterface: function(iid) {
  if (iid.equals(Ci.nsISupports) ||
      iid.equals(Ci.nsIFactory))
   return this;
  throw Cr.NS_ERROR_NO_INTERFACE;
 }
}

const module = {
 registerSelf: function(compMgr, fileSpec, location, type) {
  compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
  compMgr.registerFactoryLocation(
   CLASS_ID, 
   "microb content policy",
   CONTRACT_ID,
   fileSpec,
   location,
   type);
  var cm = Cc["@mozilla.org/categorymanager;1"]
                .getService(Ci.nsICategoryManager);
  cm.addCategoryEntry(
   "content-policy",
   CONTRACT_ID,
   CONTRACT_ID,
   true,
   true);
 },
 unregisterSelf: function(compMgr, fileSpec, location) {
  compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
  compMgr.unregisterFactoryLocation(CLASS_ID, fileSpec);
  var cm = Cc["@mozilla.org/categorymanager;1"]
                .getService(Ci.nsICategoryManager);
  cm.deleteCategoryEntry("content-policy", CONTRACT_ID, true);
 },
 getClassObject: function(compMgr, cid, iid) {
  if (cid.equals(CLASS_ID))
   return factory;
  throw Cr.NS_ERROR_NOT_REGISTERED;
 },
 canUnload: function(compMgr) {
  return true;
 }
}

function NSGetModule(comMgr, fileSpec) {
 return module;
}

