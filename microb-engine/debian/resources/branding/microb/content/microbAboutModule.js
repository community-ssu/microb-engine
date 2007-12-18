/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
function microbAboutRedirector() { }

function NS_GetAboutModuleName(aAboutURI) {
  return aAboutURI.path.replace(/[#?].*/, "").toLowerCase();
}

microbAboutRedirector.prototype = {
  QueryInterface: function microbAboutRedirector_QueryInterface(iid) {
    if (iid.equals(Components.interfaces.nsIAboutModule) ||
        iid.equals(Components.interfaces.nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  whats: {
    system: {
      url: "file:///var/lib/browser-data/about-system.html",
      /* only chrome: needs the UNTRUSTED flag, since we're not chrome,
       * we omit it.
       */
      flags: 0
    }
  },

  newChannel: function microbAboutRedirector_newChannel(aURI)
  {
    var path = NS_GetAboutModuleName(aURI);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);

    if (!(path in this.whats))
      throw Components.results.NS_ERROR_ILLEGAL_VALUE;
    var mapped = this.whats[path];

    var tempChannel = ioService.newChannel(mapped.url, null, null);
    tempChannel.setOriginalURI(aURI);

    // Keep the page from getting unnecessary privileges unless it needs them
    if (mapped.flags &
        Components.interfaces.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT)
    {
      securityManager = Components.classes[NS_SCRIPTSECURITYMANAGER_CONTRACTID].getService(Components.interfaces.nsIScriptSecurityManager);
      principal = securityManager.getCodebasePrincipal(aURI);
      tempChannel.setOwner(principal);
    }
    return tempChannel;
  },

  getURIFlags: function microbAboutRedirector_getURIFlags(aURI)
  {
    var name = NS_GetAboutModuleName(aURI);
    if (!(name in this.whats))
      throw Components.results.NS_ERROR_ILLEGAL_VALUE;

    return this.whats[name].flags;
  }
}

var myModule = {
  registerSelf: function (compMgr, fileSpec, location, type) {
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    var whats = microbAboutRedirector.prototype.whats;
    for (var i in whats) {
      var what = whats[i];
      compMgr.registerFactoryLocation(this.myCID,
                                      this.myDescription + '-' + what,
                                      this.myProgIDprefix + what,
                                      fileSpec,
                                      location,
                                      type);
    }
  },

  getClassObject: function (compMgr, cid, iid) {
    if (!cid.equals(this.myCID))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (!iid.equals(Components.interfaces.nsIFactory) &&
      !iid.equals(Components.interfaces.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    return this.myFactory;
  },

  /* CID for this class */
  myCID: Components.ID("{7cf8ae11-f6da-46cc-8638-69cdafd32420}"),

  /* description for this class */
  myDescription: "MicroB about redirector",

  /* ProgID for this class */
  myProgIDprefix: "@mozilla.org/network/protocol/about;1"+"?what=",

  /* factory object */
  myFactory: {
    createInstance: function (outer, iid) {
      if (outer != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;

      return (new microbAboutRedirector()).QueryInterface(iid);
    }
  },

  canUnload: function(compMgr) {
    return true;
  }
};

function NSGetModule(compMgr, fileSpec) {
  return myModule;
}
