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
 * The Original Code is XPConnect Stubs for JavaScript Shell.
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
 /**
  * Ever wondered what xpcom looked like from the perspective of javascript?
  *
  * This is an explanation of basic XPCOM objects to a very primitive javascript shell
  *
  * This shell is called "jsshell", sometimes js.exe, jsshell.exe, or similar.
  * It can be built multithreaded (if you feed it an nspr) or single threaded (default)
  * Note that while xpcshell is multithreaded, building jsshell multithreaded isn't
  * inherently useful as it doesn't actually expose a way to create threads.
  *
  * I might at some point add *very* evil emulation of threading to this world,
  * probably by replacing various default methods on important objects with things
  * that service thread queues.
  *
  * If you aren't familiar with interfaces, you probably will want to read some
  * reference about them. XPCOM is based on MSCOM which is built on IDL (interface
  * definition language) files.
  *
  * not yet implemented is a way to hide non exported properties
  * and nsIXPCWrappedJSObjectGetter - xpconnect_wrapped_object.wrappedJSObject
  * which allows a js object to bleed out.
  *
  * This code is growing to the point that DOM Core and XPCOM Core should be split
  * out of XPConnect Core.
  */

 /* In a top level function, |this| is global scope.
  * but you can't easily/correctly get to this from the context a member function of
  * normal object.
  * you could of course have a lame function get_GlobalScope() { return this }
  * and that would work, but it seems better to just store global scope and at least
  * save one useless method call.
  */
 var _parent_ = this;

 /* these are basic convenience functions they don't have to be on Math, but I'm lazy */
 /* randInt
  * returns a random number between 0 and range - 1
  */
 Math.randInt = function(range){return Math.random()*range >>0};
 /* randHex
  * returns a string of count hex digits
  * mod forces the low bits to 0
  * XXX sometimes this turns out to be negative, i never figured out why.
  */
 Math.randHex = function(count, mod){
  var hex = '00000000' + (Math.randInt(Math.pow(2,4*count)) & ~ mod).toString(16);
  return hex.substr(-count);
 };
 Math.randPtr = function() {
  return Math.randHex(6, 7);
 }
 /* randHexQ returns a random hex quad (4 hex digits)
  */
 Math.randHexQ = function(){return Math.randHex(4)};
 /* returns a random CID/IID/GUID
  */
 Math.randCID = function(){
  return '{'+
   [
    [Math.randHexQ(),Math.randHexQ()].join(''),
    Math.randHexQ(),
    Math.randHexQ(),
    Math.randHexQ(),
    [Math.randHexQ(),Math.randHexQ(),Math.randHexQ()].join(''),
   ].join('-')+'}';
 }
 function dumpStack() {
  for (frame = Components.stack; frame; frame = frame.caller)
   print(frame);
 }
 /* xpconnect gives a pretty toString to all xpcom objects
  * it looks something like this
  * note that each object will have a fixed address/native address.
  * XXX of course, ideally it wouldn't risk having the same address as
  * another object.
  *
  * Note that we give out this method to xpcom objects when we
  * create them. @see ComponentClass.prototype.createInstance.
  */
 function toString(){
  /* pointers in JavaScript are tagged: the low 3 bits (07)
   * are used to represent other states. Thankfully for
   * JavaScript, memory allocation in modern systems is at
   * least word aligned, so these 3 bits are always available.
   *
   * We emulate that feature by telling randHex to clear those
   * bits.
   */
  if (!this.jsAddress)
   this.jsAddress = Math.randPtr();
  if (!this.natAddress)
   this.natAddress = Math.randPtr();
  var ifaces = [];
  var kind = "object";
  if (this.markedInterfaces) {
   kind = "xpconnect wrapped";
   /* if we're flattening interfaces then,
    * we've been keeping track of them in this.markedInterfaces
    *
    * convert the list from markedInterfaces into an Array.
    */
   for (var i in this.markedInterfaces)
    ifaces.push(i);
   if (ifaces.length > 2) {
    /* xpconnect will display all flattened interfaces
     * if there are at least two interfaces other than nsISupports
     */
    ifaces = '(' + ifaces.join(', ') + ')';
   } else if (ifaces.length == 2) {
    /* xpconnect will display the interfaces that isn't nsISupports
     * if there is only one such interface.
     */
    ifaces = ifaces[1];
   } else if (ifaces.length == 1) {
    /* xpconnect will display nsISupports if it doesn't know anything else
     */
    ifaces = ifaces[0];
   } else {
    /* if someone else implemented QueryInterface and did it "wrong"
     * then we'll be nice and list "nsISupports"
     *
     * Note: markedInterfaces is not really part of the contract for
     * QueryInterface, it's part of the contract for XPConnect.
     * as such, it's not fair to require markedInterfaces to work.
     *
     * Note: eventually the QueryInterface method on objects created by
     * ComponentClass.createInstance will be overridden with a special
     * QI which enforces interface flattening and chains to the
     * object's query interface method. At that time, this else would
     * really be eligible to be an NS_NOTREACHED.
     */
    ifaces = "nsISupports";
   }
  } else {
   /* this toString function is also usable by other non xpconnect wrapped creatures.
    */
   ifaces = (this.name || this.constructor.name);
  }
  return "[" + kind + " " +
         ifaces +
         " @ 0x"+this.jsAddress +
         " (native @ 0x"+this.natAddress +
         ")]";
 }
 /* this is an alternate toString method
  */
 function name_toString() {
  return this.name;
 }
 /* This is "table" driven QueryInterface using nsIClassInfo.interfaces.
  * It also includes xpconnect style interface flattening (this.markedInterfaces).
  * If the interface can not be found, it will throw Components.results.NS_ERROR_NO_INTERFACE,
  * just as a proper QueryInterface implementation would.
  *
  * Technically this does not yet consider nsIClassInfo, although it sorta works for any js
  * component that uses this.interfaces. Full flattening would need to consider
  * this.getInterfaces().
  *
  * actually, technically table driven would involve treating markedInterfaces and interfaces
  * as string hashes, and I haven't done that yet, but it's possible.
  */
 function QueryInterface(iid) {
  /* This opportunistic discovery is what xpconnect does when there is no
   * QueryInterface method.
   * Any interface that is asked about is assumed to be able to work.
   * Missing methods or Attributes will result in exceptions when they're
   * probed.
   */
  if (!this.interfaces) {
   /* well, except for nsISupportsWeakReference
    */
   if (interfaces.nsISupportsWeakReference.equals(iid))
    throw Components.results.NS_ERROR_NO_INTERFACE;
   return this;
  }
  /* check for interface flattening */
  if (this.markedInterfaces) {
   /* check for flattened interface */
   if (iid in this.markedInterfaces) {
    /* check for interface that is not implemented as a tear off.
     * true is used to avoid gratuitous circular references in the object graph.
     */
    if (this.markedInterfaces[iid] == true)
     return this;
    /* return tear off object */
    return this.markedInterfaces[iid];
   }
  } else {
   /* If this is the first time we've been called to QI, then we setup our interface flattening
    * cache and include nsISupports, since the only method required for it is QueryInterface,
    * and the fact that we've been called means the object implements nsISupports.QueryInterface.
    */
   this.markedInterfaces = {
    nsISupports: true
   };
  }
  /* This is the table driven QI portion */
  for (var i = 0; i < this.interfaces.length; ++i) {
   if (!this.interfaces[i]) {
    /* this is bad, nsIClassInfo would assert.
     * for now, we silently ignore this.
     */
    continue;
   }
   if (this.interfaces[i].equals(iid)) {
    if (interfaces.nsISupportsWeakReference.equals(iid)) {
     return this.markedInterfaces[iid] = (new SupportsWeakReference(this)).QueryInterface(iid);
    }
    /* We don't support tearoffs.
     * Conceptually, if you're writing a tearoff,
     * then you need to write your own QueryInterface
     * implementation anyway.
     *
     * if we did support tear offs, then instead of true
     * we would store object pointers.
     * and when this happens, it'll happen because
     * we're delegating QI to the Object's real implementation.
     */
    this.markedInterfaces[iid] = true;
    return this;
   }
  }
  if ('QueryInterface' in this.constructor.prototype) {
   var result = this.constructor.prototype.QueryInterface.apply(this, arguments);
   this.markedInterfaces[iid] = result;
   return result;
  }
  throw Components.results.NS_ERROR_NO_INTERFACE;
 }
 /* this is an attempt to map GetInterface into a map
  */
 function GetInterface(iid) {
  var requested = QueryInterface;
  if (this.requestableInterfaces) {
   if (iid in this.requestableInterfaces) {
    var requested = this.requestableInterfaces[iid];
    switch (typeof requested) {
     case 'string':
      if (typeof this[requested] != 'function')
       return this[requested];
      requested = this[requested];
      /* this is evil, it's chaining */
     case 'function':
      /* this is evil, it's going to trigger a call later */
      break;
    }
   }
  }
  return requested.call(this, arguments);
 }
 /* this is the generic "we trust you" impl */
 function getInterface() {
  return this;
 }
 /* this is a stub */
 function NOP() {
  if (0) {
   debug(arguments);
  }
 }
 /* This is a basic equals method
  */
 function equals(identity) {
  return this == identity;
 }
 /* This allows for objects to be equal if they are of the same class
  * and have the same string representation.
  */
 function weak_equals(item) {
  return this.constructor == item.constructor &&
         this.toString() == item.toString();
 }
 /* ID Constructor - used by Components.ID
  */
 function ID(id) {
  this.name = id;
 }
 ID.prototype = {
  constructor: ID,
  toString: name_toString,
  QueryInterface: QueryInterface,
  equals: weak_equals,
  /* minor circular problem
   * nsIJSID doesn't exist yet because we're defining the prototype now
   */
  interfaces: []
 }
 /* Interface Constructor - used by members of Components.interfaces */
 function Interface(name, proto) {
  this.name = name;
  /* a bit of evil here we allow the caller to pass a prototype */
  if (proto) {
   /* it they do, we chain our prototype to theirs */
   this.__proto__ = proto;
  } else {
   /* it they don't, we just use our own */
   proto = this;
  }
  proto.__proto__ = Interface_prototype;
 }
 var Interface_prototype = {
  constructor: Interface,
  toString: function toString() { return this.name },
  QueryInterface: QueryInterface,
  equals: equals
 }
 /* Components.interfaces */
 function nsXPCComponents_Interfaces(){}
 nsXPCComponents_Interfaces.prototype = {
  constructor: nsXPCComponents_Interfaces,
  toString: toString,
  QueryInterface: QueryInterface
 };
 var interfaces = new nsXPCComponents_Interfaces;
 /* method to generate interface lists */
 function buildInterfaceList(list) {
try {
  /* list is a comma delimited list of interface names */
  list = list.split(',');
  /* nsISupports is implied, but we don't want to list it twice */
  var nsISupports = false;
  /* convert interface strings into interfaces starting with the last interface */
  for (var i = list.length; --i >= 0; ) {
   var iface = list[i];
   /* record nsISupports if we found it */
   if (iface == 'nsISupports')
    nsISupports = true;
   if (interfaces[iface]) {
    /* replace the interface name with the interface object */
    list[i] = interfaces[iface];
   } else {
    /* if the interface isn't available remove it from the table */
    list.splice(i,1);
    /* and complain */
    print('buildInterfaceList could not find: '+iface);
   }
  }
  /* if nsISupports isn't in the list, stick it at the beginning */
  if (!nsISupports)
   list.unshift(interfaces.nsISupports);
  return list;
} catch (e) {
 print (e);
 dumpStack();
 return '';
}
 }
 /* method to add a list of interfaces to Components.interfaces that have no prototype */
 function addInterfaces() {
  for (var i = 0; i < arguments.length; ++i) {
   var intname = arguments[i];
   interfaces[intname] = new Interface(intname);
  }
 }
 /* BEGIN_GENERATED add basic interfaces this section is generated from writeAddInterfaces in xpcshell */
 addInterfaces.apply(null, [
  "nsIAuthPromptAdapterFactory",
  "nsICollection",
  "nsICategoryManager",
  "nsIComponentManager",
  "nsIComponentRegistrar",
  "nsIDocumentLoader",
  "nsIDOMEventListener",
  "nsIFactory",
  "nsIInterfaceRequestor",
  "nsIJSID",
  "nsIObserver",
  "nsIObserverService",
  "nsIProgressEventSink",
  "nsIRequestObserver",
  "nsISerializable",
  "nsISupportsArray",
  "nsISimpleEnumerator",
  "nsISecurityEventSink",
  "nsISupportsWeakReference",
  "nsISupports",
  "nsIWeakReference",
  "nsIWindowCreator",
  "nsIWindowWatcher",
  "nsPIWindowWatcher",
 ]
 );
 /* END_GENERATED */
 /* this function is for use in xpcshell. */
 function stubWorld(method, blacklist, whitelist) {
  switch (arguments.length) {
  case 0:
   method = 'getService';
  case 1:
   blacklist = {};
   whitelist = Components.classes;
  case 2:
  default:
  }
  for (contract in whitelist) try {
   if (whitelist[contract] instanceof Function)
    continue;
   if (uneval(blacklist).length > 4) {
    if (contract in blacklist) {
     delete blacklist[contract];
     continue;
    }
    /* continue; */
   }
   var contract = '' + whitelist[contract];
   var name = 'ns_'+contract.replace(/@[^\/]*/,'').replace(/;.*/,'').replace(/[^a-z0-9]+/ig,'_');
   name = name.replace(/_+([a-z])/gi, function (a,b) {return b.toUpperCase()});
   print(' Components.addClass(null, new Factory('+name+'), "'+contract+'");');
   print(' /* "'+contract+'" */');
   print(' function '+name+'() {}\n '+name+'.prototype = {');
   print('  constructor: '+name+',');
   /* this isn't legal per xpcom, but we're just searching for things */
   var svc = Components.classes[contract][method]();
   stubObject(svc);
   if (/\[?xpconnect wrapped \(?(\S+?)\)?\s*\]/.test(svc.nsISupports.toString.call(svc).replace(/, /g,','))) {
    print('  interfaces: buildInterfaceList("'+RegExp.$1+'")');
   } else {
    print('  nointerfaces: null');
   }
   print(' }');
  } catch (e) {
   print(e);
  }
 }
 /* this function is for use in xpcshell. */
 function stubObject(unknown) {
  for (var iface in Components.interfaces) {
   try {
    if (!(unknown instanceof Components.interfaces[iface]))
     continue;
    print ('  /* ' + iface + ' */');
    /* XXX should use xptiinterfaceinfo if it's available */
    for (var attr in unknown[iface]) {
     if (attr == "QueryInterface")
      continue;
     if (attr in Components.interfaces[iface])
      continue;
     try {
      var method = unknown[iface][attr];
      if (method instanceof Function) {
       var args = [];
       for (var i = 0; i < method.length; ++i)
        args.push('a'+i);
       print('  '+attr+': function '+attr+'('+args.join(', ')+'){},');
      } else {
       print('  '+attr+': /* attribute */'+uneval(method)+',');
      }
     } catch (e) {
      print('  '+attr+': /* exception */null,');
     }
    }
   } catch (e) {}
  }
 }
 function knownStubWorld() {
  stubWorld('getService', {
   "@mozilla.org/messenger/messageservice;1?type=imap": 1,
   "@mozilla.org/messenger/server;1?type=nntp": 1,
   "@mozilla.org/uriloader/content-handler;1?type=x-application-imapfolder": 1,
   "@mozilla.org/xul/xul-template-builder;1": 1,
   "@mozilla.org/network/ldap-message;1": 1,
   "@mozilla.org/messenger/messageservice;1?type=imap-message": 1,
   "@mozilla.org/messenger/server;1?type=rss": 1,
   "@mozilla.org/generic-factory;1": 1,
   "@mozilla.org/messenger/server;1?type=pop3": 1,
   "@mozilla.org/xmlextras/proxy/webservicepropertybagwrapper;1": 1,
   "@mozilla.org/messengercompose/smtpurl;1": 1,
   "@mozilla.org/addressbook/carddatabase;1": 1,
   "@mozilla.org/browser/shistory-internal;1": 1,
   "@mozilla.org/network/async-stream-copier;1": 1,
   "@mozilla.org/messenger/protocol/info;1?type=imap": 1,
   "@mozilla.org/network/protocol;1?name=imap": 1,
   "@mozilla.org/addressbook/abview;1": 1,
   "@mozilla.org/messenger/server;1?type=none": 1,
   "@mozilla.org/messenger/imapservice;1": 1,
   "@mozilla.org/messenger/server;1?type=imap": 1,
   "@mozilla.org/browser/shistory;1": 1,
   "@mozilla.org/xul/xul-tree-builder;1": 1,
   "@mozilla.org/js/xpc/test/Noisy;1": 1,
   "@mozilla.org/svg/svg-document;1": 1,
   "@mozilla.org/content/canvas-rendering-context;1?id=2d": 1,
   "@mozilla.org/messenger/msgdbview;1?type=xfvf": 1
  });
 }
 /* this function is for use in xpcshell.
  * it is absolutely useless here, although it would work...
  */
 function writeAddInterface(iface) {
  /* ok, it's slightly evil, it's both writeAddInterfaces(array) */
  if (iface instanceof Array) {
   var plain = [];
   for (var i = 0; i < iface.length; ++i) {
    var result = writeAddInterface(iface[i]);
    /* if there's a result that means that we are responsible for writing the interface */
    if (result)
     plain.push('  "'+result+'"');
   }
   /* which we do here, if at least one of the interfaces had no properties */
   if (plain.length)
    print(' addInterfaces.apply(null, [\n'+plain.join(',\n')+'\n ]\n );');
   return '';
  }
  /* and writeAddInterface(interface) */
  var name;
  if (typeof iface == "string") {
   name = iface;
   iface = Components.interfaces[iface];
  } else {
   name = ''+iface;
  }
  var attrs = [];
  for (i in iface) {
   if (typeof iface[i] == 'number')
    attrs.push('  '+i+':'+iface[i]);
  }
  if (attrs.length) {
   /* in this flavor, we write out a single addInterface with prototype */
   print(' addInterface("'+name+'", {\n'+attrs.join(',\n')+'\n });');
   return '';
  }
  /* in this flavor, we rely on writeAddInterfaces() to coalesce us with the other interfaces */
  return name;
 }
 /* add an interface with its prototype to Components.interfaces */
 function addInterface(name, proto) {
  interfaces[name] = new Interface(name, proto);
 }
 /* BEGIN_GENERATED this section is generated from writeAddInterfaces in xpcshell */
 addInterface("nsISupportsCString", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsChar", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsDouble", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsFloat", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsID", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsInterfacePointer", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRBool", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRInt16", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRInt32", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRInt64", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRTime", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRUint16", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRUint32", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRUint64", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPRUint8", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsPrimitive", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsString", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsISupportsVoid", {
  TYPE_ID:1,
  TYPE_CSTRING:2,
  TYPE_STRING:3,
  TYPE_PRBOOL:4,
  TYPE_PRUINT8:5,
  TYPE_PRUINT16:6,
  TYPE_PRUINT32:7,
  TYPE_PRUINT64:8,
  TYPE_PRTIME:9,
  TYPE_CHAR:10,
  TYPE_PRINT16:11,
  TYPE_PRINT32:12,
  TYPE_PRINT64:13,
  TYPE_FLOAT:14,
  TYPE_DOUBLE:15,
  TYPE_VOID:16,
  TYPE_INTERFACE_POINTER:17
 });
 addInterface("nsITimer", {
  TYPE_ONE_SHOT:0,
  TYPE_REPEATING_SLACK:1,
  TYPE_REPEATING_PRECISE:2
 });
 addInterface("nsIWebProgress", {
  NOTIFY_ALL: 0xfff
 });
 addInterface("nsIWebProgressListener", {
  STATE_START:1,
  STATE_REDIRECTING:2,
  STATE_TRANSFERRING:4,
  STATE_NEGOTIATING:8,
  STATE_STOP:16,
  STATE_IS_REQUEST:65536,
  STATE_IS_DOCUMENT:131072,
  STATE_IS_NETWORK:262144,
  STATE_IS_WINDOW:524288,
  STATE_RESTORING:16777216,
  STATE_IS_INSECURE:4,
  STATE_IS_BROKEN:1,
  STATE_IS_SECURE:2,
  STATE_SECURE_HIGH:262144,
  STATE_SECURE_MED:65536,
  STATE_SECURE_LOW:131072
 });
 addInterface("nsIProgrammingLanguage", {
  JAVASCRIPT:2,
  UNKNOWN:0,
  CPLUSPLUS:1,
  PYTHON:3,
  PERL:4,
  JAVA:5,
  ZX81_BASIC:6,
  JAVASCRIPT2:7,
  RUBY:8,
  PHP:9,
  TCL:10,
  MAX:10
 });
 addInterface("nsISupportsPriority", {
  PRIORITY_HIGHEST:-20,
  PRIORITY_HIGH:-10,
  PRIORITY_NORMAL:0,
  PRIORITY_LOW:10,
  PRIORITY_LOWEST:20
 });
 addInterface("nsIChannelEventSink", {
  REDIRECT_TEMPORARY:1,
  REDIRECT_PERMANENT:2,
  REDIRECT_INTERNAL:4
 });
 addInterface("nsIClassInfo", {
  SINGLETON:1,
  THREADSAFE:2,
  MAIN_THREAD_ONLY:4,
  DOM_OBJECT:8,
  PLUGIN_OBJECT:16,
  EAGER_CLASSINFO:32,
  CONTENT_NODE:64,
  RESERVED:2147483648
 });
 addInterface("nsIDocShellTreeItem", {
  typeChrome:0,
  typeContent:1,
  typeContentWrapper:2,
  typeChromeWrapper:3,
  typeAll:2147483647
 });
 addInterface("nsIDOMChromeWindow",
  {STATE_MAXIMIZED:1,
  STATE_MINIMIZED:2,
  STATE_NORMAL:3
 });
 addInterface("nsIDOMXMLDocument", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOMDocument", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOMCSSMozDocumentRule", {
  UNKNOWN_RULE:0,
  STYLE_RULE:1,
  CHARSET_RULE:2,
  IMPORT_RULE:3,
  MEDIA_RULE:4,
  FONT_FACE_RULE:5,
  PAGE_RULE:6
 });
 addInterface("nsIDOMDocumentFragment", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOMHTMLDocument", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOMSVGDocument", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOM3Document", {
  DOCUMENT_POSITION_DISCONNECTED:1,
  DOCUMENT_POSITION_PRECEDING:2,
  DOCUMENT_POSITION_FOLLOWING:4,
  DOCUMENT_POSITION_CONTAINS:8,
  DOCUMENT_POSITION_CONTAINED_BY:16,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:32
 });
 addInterface("nsIDOMDocumentType", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDocumentEncoder", {
  OutputSelectionOnly:1,
  OutputFormatted:2,
  OutputRaw:4,
  OutputBodyOnly:8,
  OutputPreformatted:16,
  OutputWrap:32,
  OutputFormatFlowed:64,
  OutputAbsoluteLinks:128,
  OutputEncodeW3CEntities:256,
  OutputCRLineBreak:512,
  OutputLFLineBreak:1024,
  OutputNoScriptContent:2048,
  OutputNoFramesContent:4096,
  OutputNoFormattingInPre:8192,
  OutputEncodeBasicEntities:16384,
  OutputEncodeLatin1Entities:32768,
  OutputEncodeHTMLEntities:65536,
  OutputPersistNBSP:131072
 });
 addInterface("nsIFile", {
  NORMAL_FILE_TYPE:0,
  DIRECTORY_TYPE:1
 });
 addInterface("nsILocalFile", {
  NORMAL_FILE_TYPE:0,
  DIRECTORY_TYPE:1
 });
 addInterface("nsIWebNavigation", {
  LOAD_FLAGS_MASK:65535,
  LOAD_FLAGS_NONE:0,
  LOAD_FLAGS_IS_REFRESH:16,
  LOAD_FLAGS_IS_LINK:32,
  LOAD_FLAGS_BYPASS_HISTORY:64,
  LOAD_FLAGS_REPLACE_HISTORY:128,
  LOAD_FLAGS_BYPASS_CACHE:256,
  LOAD_FLAGS_BYPASS_PROXY:512,
  LOAD_FLAGS_CHARSET_CHANGE:1024,
  LOAD_FLAGS_STOP_CONTENT:2048,
  LOAD_FLAGS_FROM_EXTERNAL:4096,
  LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP:8192,
  LOAD_FLAGS_FIRST_LOAD:16384,
  STOP_NETWORK:1,
  STOP_CONTENT:2,
  STOP_ALL:3
 });
 addInterface("nsIDOMNode", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOM3Node", {
  DOCUMENT_POSITION_DISCONNECTED:1,
  DOCUMENT_POSITION_PRECEDING:2,
  DOCUMENT_POSITION_FOLLOWING:4,
  DOCUMENT_POSITION_CONTAINS:8,
  DOCUMENT_POSITION_CONTAINED_BY:16,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:32
 });
 addInterface("nsIDOMHTMLFrameSetElement", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 addInterface("nsIDOMHTMLFrameElement", {
  ELEMENT_NODE:1,
  ATTRIBUTE_NODE:2,
  TEXT_NODE:3,
  CDATA_SECTION_NODE:4,
  ENTITY_REFERENCE_NODE:5,
  ENTITY_NODE:6,
  PROCESSING_INSTRUCTION_NODE:7,
  COMMENT_NODE:8,
  DOCUMENT_NODE:9,
  DOCUMENT_TYPE_NODE:10,
  DOCUMENT_FRAGMENT_NODE:11,
  NOTATION_NODE:12
 });
 /* END_GENERATED this section is generated from writeAddInterfaces in xpcshell */
 /* We're adding nsIJSID */
 ID.prototype.interfaces.push(interfaces.nsIJSID);
 function Factory(clazz) {
  if (!clazz.prototype.QueryInterface ||
      clazz.prototype.QueryInterface != QueryInterface)
   clazz.prototype.QueryInterface = QueryInterface;
  this.clazz = clazz;
 }
 /* Generic Factory for use by xpcom wrapper. This is not yet equivalent to
  * nsGenericFactory.
  */
 Factory.prototype = {
  constructor: Factory,
  toString: toString,
  QueryInterface: QueryInterface,
  createInstance: function createInstance(outer, iid) {
   var instance = new this.clazz;
   if (instance.QueryInterface != QueryInterface)
    instance.QueryInterface = QueryInterface;
   return instance.QueryInterface(iid);
  }
 }
 /* this is a useless method it's slightly evil */
 function debug(args) {
  /* accumulate arguments */
  var a = [];
  for (var i = 0; i < args.length; ++i) {
   a.push(args[i]);
  }
  /* spit them out */
  try {
   dump(uneval(a));
  } catch (e) {
   dump('can not debug');
  }
 }
 /* this is a stub */
 function SimpleEnumerator(ary) {
  this.array = ary;
  this.index = 0;
 }
 SimpleEnumerator.prototype = {
  constructor: SimpleEnumerator,
  /* This isn't the standard toString because it might be useful to know how far we are through our enumeration. */
  toString: function toString() { return "[xpconnect wrapped nsISimpleEnumerator ("+this.index+"/"+this.array.length+")]";},
  QueryInterface: QueryInterface,
  /* nsISupportsEnumerator */
  hasMoreElements: function hasMoreElements() {
   return this.index < this.array.length;
  },
  getNext: function getNext(iid) {
   return this.array[this.index++];
  },
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsISimpleEnumerator")
 }
 /* Unfortunate little problem:
  *  Consider the sequence for: Components.classes[contract].createInstance()
  *  1. a factory is called
  *  2. the factory calls new on the real constructor
  *  3. the real constructor does whatever it feels like
  *  4. the factory returns the object qi'd to the interface specified
  *  5. createInstance() now has the ability to wrap the object and manipulate
  *     its prototype chain, e.g. by adding a toString() method and a QueryInterface()
  *     method.
  *
  * Unfortunately, 5 is way too late for this case:
  *  An object has a QI method that returns this for nsISupportsWeakReference.
  *  In its constructor it passes this to an xpcom class which QIs to nsISupportsWeakReference
  *  and then calls GetWeakReference().
  *
  * The solution is to have this method which should cover most cases
  */
 function do_GetWeakReference(object) {
  if (!object.QueryInterface ||
      object.QueryInterface(interfaces.nsISupports) == object.QueryInterface(interfaces.nsISupportsWeakReference)) {
   if (object.toString == Object.prototype.toString)
    object.toString = toString;
   object.QueryInterface = QueryInterface;
  }
  return object.QueryInterface(interfaces.nsISupportsWeakReference).GetWeakReference();
 }
 /* this implementation of nsIWeakReference actually uses a strong reference
  * to emulate being weak, it's possible
  */
 function WeakReference(referent) {
  this.referent = referent;
 }
 WeakReference.prototype = {
  constructor: WeakReference,
  /* This object is special and is not created by factories, so we include toString and QueryInterface */
  toString: toString,
  QueryInterface: QueryInterface,
  QueryReferent: function QueryReferent(iid) {
   if (!this.referent)
    throw Components.results.NS_ERROR_NULL_POINTER;
   return this.referent.QueryInterface(iid);
  },
  interfaces: buildInterfaceList("nsIWeakReference")
 }
 function SupportsWeakReference(referent) {
  this.strongReference = referent;
 }
 SupportsWeakReference.prototype = {
  constructor: SupportsWeakReference,
  /* This object is special and is not created by factories, so we include toString */
  toString: toString,
  QueryInterface: function QueryInterface(iid) {
   if (Components.interfaces.nsISupportsWeakReference.equals(iid))
    return this;
   return this.strongReference.QueryInterface(iid);
  },
  GetWeakReference: function GetWeakReference() {
   if (this.weakReference)
    return this.weakReference;
   return this.weakReference = new WeakReference(this);
  },
  interfaces: buildInterfaceList("nsISupportsWeakReference")
 }
 /* "@mozilla.org/supports-PRUint64;1" */
 function nsSupportsPRUint64() {}
 nsSupportsPRUint64.prototype = {
  constructor: nsSupportsPRUint64,
  /* nsISupportsPRUint64 */
  type: /* attribute */8,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */8,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRUint64,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRInt32;1" */
 function nsSupportsPRInt32() {}
 nsSupportsPRInt32.prototype = {
  constructor: nsSupportsPRInt32,
  /* nsISupports */
  /* nsISupportsPRInt32 */
  type: /* attribute */12,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupportsPrimitive */
  type: /* attribute */12,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRInt32,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRUint8;1" */
 function nsSupportsPRUint8() {}
 nsSupportsPRUint8.prototype = {
  constructor: nsSupportsPRUint8,
  /* nsISupportsPRUint8 */
  type: /* attribute */5,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */5,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRUint8,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-cstring;1" */
 function nsSupportsCstring() {}
 nsSupportsCstring.prototype = {
  constructor: nsSupportsCstring,
  /* nsISupports */
  /* nsISupportsCString */
  type: /* attribute */2,
  data: /* attribute */"",
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupportsPrimitive */
  type: /* attribute */2,
  interfaces: buildInterfaceList("nsISupports,nsISupportsCString,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-double;1" */
 function nsSupportsDouble() {}
 nsSupportsDouble.prototype = {
  constructor: nsSupportsDouble,
  /* nsISupportsDouble */
  type: /* attribute */15,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */15,
  interfaces: buildInterfaceList("nsISupports,nsISupportsDouble,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-string;1" */
 function nsSupportsString() {}
 nsSupportsString.prototype = {
  constructor: nsSupportsString,
  /* nsISupportsString */
  type: /* attribute */3,
  data: /* attribute */"",
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */3,
  interfaces: buildInterfaceList("nsISupports,nsISupportsString,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-id;1" */
 function nsSupportsId() {}
 nsSupportsId.prototype = {
  constructor: nsSupportsId,
  /* nsISupportsID */
  type: /* attribute */1,
  data: /* attribute */null,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */1,
  interfaces: buildInterfaceList("nsISupports,nsISupportsID,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRInt64;1" */
 function nsSupportsPRInt64() {}
 nsSupportsPRInt64.prototype = {
  constructor: nsSupportsPRInt64,
  /* nsISupportsPRInt64 */
  type: /* attribute */13,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */13,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRInt64,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-array;1" */
 function nsSupportsArray() {}
 nsSupportsArray.prototype = {
  constructor: nsSupportsArray,
  /* nsISerializable */
  read: function read(a0){},
  write: function write(a0){},
  /* nsISupports */
  /* nsICollection */
  read: function read(a0){},
  write: function write(a0){},
  Count: function Count(){},
  GetElementAt: function GetElementAt(a0){},
  QueryElementAt: function QueryElementAt(a0, a1){},
  SetElementAt: function SetElementAt(a0, a1){},
  AppendElement: function AppendElement(a0){},
  RemoveElement: function RemoveElement(a0){},
  Enumerate: function Enumerate(){},
  Clear: function Clear(){},
  /* nsISupportsArray */
  read: function read(a0){},
  write: function write(a0){},
  Count: function Count(){},
  GetElementAt: function GetElementAt(a0){},
  QueryElementAt: function QueryElementAt(a0, a1){},
  SetElementAt: function SetElementAt(a0, a1){},
  AppendElement: function AppendElement(a0){},
  RemoveElement: function RemoveElement(a0){},
  Enumerate: function Enumerate(){},
  Clear: function Clear(){},
  GetIndexOf: function GetIndexOf(a0){},
  GetIndexOfStartingAt: function GetIndexOfStartingAt(a0, a1){},
  GetLastIndexOf: function GetLastIndexOf(a0){},
  DeleteLastElement: function DeleteLastElement(a0){},
  DeleteElementAt: function DeleteElementAt(a0){},
  Compact: function Compact(){},
  clone: function clone(){},
  interfaces: buildInterfaceList("nsISupports,nsISerializable,nsICollection,nsISupportsArray")
 }
 /* "@mozilla.org/supports-float;1" */
 function nsSupportsFloat() {}
 nsSupportsFloat.prototype = {
  constructor: nsSupportsFloat,
  /* nsISupportsFloat */
  type: /* attribute */14,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */14,
  interfaces: buildInterfaceList("nsISupports,nsISupportsFloat,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRInt16;1" */
 function nsSupportsPRInt16() {}
 nsSupportsPRInt16.prototype = {
  constructor: nsSupportsPRInt16,
  /* nsISupportsPRInt16 */
  type: /* attribute */11,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */11,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRInt16,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-interface-pointer;1" */
 function nsSupportsInterfacePointer() {}
 nsSupportsInterfacePointer.prototype = {
  constructor: nsSupportsInterfacePointer,
  /* nsISupports */
  /* nsISupportsInterfacePointer */
  type: /* attribute */17,
  data: /* attribute */null,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  dataIID: /* attribute */null,
  /* nsISupportsPrimitive */
  type: /* attribute */17,
  interfaces: buildInterfaceList("nsISupports,nsISupportsInterfacePointer,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRTime;1" */
 function nsSupportsPRTime() {}
 nsSupportsPRTime.prototype = {
  constructor: nsSupportsPRTime,
  /* nsISupportsPRTime */
  type: /* attribute */9,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */9,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRTime,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRUint32;1" */
 function nsSupportsPRUint32() {}
 nsSupportsPRUint32.prototype = {
  constructor: nsSupportsPRUint32,
  /* nsISupportsPRUint32 */
  type: /* attribute */7,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */7,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRUint32,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRBool;1" */
 function nsSupportsPRBool() {}
 nsSupportsPRBool.prototype = {
  constructor: nsSupportsPRBool,
  /* nsISupports */
  /* nsISupportsPRBool */
  type: /* attribute */4,
  data: /* attribute */false,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupportsPrimitive */
  type: /* attribute */4,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRBool,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-PRUint16;1" */
 function nsSupportsPRUint16() {}
 nsSupportsPRUint16.prototype = {
  constructor: nsSupportsPRUint16,
  /* nsISupportsPRUint16 */
  type: /* attribute */6,
  data: /* attribute */0,
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */6,
  interfaces: buildInterfaceList("nsISupports,nsISupportsPRUint16,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-void;1" */
 function nsSupportsVoid() {}
 nsSupportsVoid.prototype = {
  constructor: nsSupportsVoid,
  /* nsISupportsVoid */
  type: /* attribute */16,
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */16,
  interfaces: buildInterfaceList("nsISupports,nsISupportsVoid,nsISupportsPrimitive")
 }
 /* "@mozilla.org/supports-char;1" */
 function nsSupportsChar() {}
 nsSupportsChar.prototype = {
  constructor: nsSupportsChar,
  /* nsISupportsChar */
  type: /* attribute */10,
  data: /* attribute */"\x00",
  setData: function setData(data) { this.data = data; },
  getData: function getData() { return this.data; },
  /* nsISupports */
  /* nsISupportsPrimitive */
  type: /* attribute */10,
  interfaces: buildInterfaceList("nsISupports,nsISupportsChar,nsISupportsPrimitive")
 }
 /* "@mozilla.org/embedcomp/appstartup-notifier;1" */
 function AppStartupNotifier(){
 }
 AppStartupNotifier.prototype = {
  constructor: AppStartupNotifier,
  observe: function appStarup() {
   var catman=Components.classes['@mozilla.org/categorymanager;1'].getService(Components.interfaces.nsICategoryManager);
   var list = catman.enumerateCategory('app-startup');
   var nsISupportsCString = Components.interfaces.nsISupportsCString;
   var nsIObserver = Components.interfaces.nsIObserver;
   while (list.hasMoreElements()) try {
    var item = list.getNext(nsISupportsCString);
    item = item.data;
    var contract = catman.getCategoryEntry('app-startup', item);
    var method = 'createInstance';
    if (/^service,(.*)$/.test(contract)) {
     contract = RegExp.$1;
     method = 'getService';
    }
    Components.classes[contract][method](nsIObserver).observe(null, 'app-startup', null);
   } catch (e) {}
  },
  interfaces: buildInterfaceList('nsIObserver')
 }
 /* "@mozilla.org/observer-service;1" */
 function ObserverService() {
 }
 ObserverService.prototype = {
  constructor: ObserverService,
  /* nsIObserverService */
  addObserver: function addObserver(observer, topic, weak) {
   var topics = this.topics;
   if (weak) {
    /* if we're supposed to own a weak reference, then we have to ask for a weak reference */
    observer = do_GetWeakReference(observer);
    topics = this.weakTopics;
   }
   if (!(topic in this.topics)) {
    this.topics[topic] = [];
   }
   var observers = this.topics[topic];
   for (var i=0; i < observers.length; ++i) {
    if (observers[i] == observer)
     return;
   }
   observers.push(observer)
  },
  removeObserver: function removeObserver(observer, topic) {
   if (!(topic in this.topics))
    return;
   var observers = this.topics[topic];
   for (var i=0; i < observers.length; ++i) {
    if (observers[i] == observer)
     return;
   }
  },
  notifyObservers: function notifyObservers(data, topic, subject) {
   var nsIObserver = Components.interfaces.nsIObserver;
   var observers = this.enumerateObservers(topic);
   while (observers.hasMoreElements()) try {
    var observer = observers.getNext(nsIObserver);
    /* apply lets us pass the same arguments we got without explicitly listing them */
    /* XXX many portions of the observer service need to be in try blocks,
     * this is probably one of them.
     */
    observer.observe.apply(observer, arguments);
   } catch (e) {}
  },
  enumerateObservers: function enumerateObservers(topic) {
   var observers = [];
   if (topic in this.topics)
    observers = observers.concat(this.topics[topic]);
   if (topic in this.weakTopics) {
    var nsIObserver = Components.interfaces.nsIObserver;
    /* weakTopics hold nsIWeakReferences, which we need to convert to nsIObservers */
    var weakTopics = this.weakTopics[topic];
    for (var i=0; i < weakTopics.length; ++i)
     observers.push(weakTopics[i].QueryReferent(nsIObserver));
   }
   return new SimpleEnumerator(observers);
  },
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsIObserverService"),
  /* private */
  weakTopics: {},
  topics: {}
 }
 /* helper for DocLoaderService */
 function LoaderServiceListener(listener, mask) {
  this.listener = listener;
  this.mask = mask;
 }
 LoaderServiceListener.prototype = {
  constructor: LoaderServiceListener,
  toString: toString
 }
 /* "@mozilla.org/docloaderservice;1" */
 function DocLoaderService(){}
 DocLoaderService.prototype = {
  constructor: DocLoaderService,
  QueryInterface: QueryInterface,
  /* nsIWebProgress */
  addProgressListener: function addProgressListener(listener, mask) {
   if (!listener)
    throw Components.results.NS_ERROR_INVALID_ARG;
   try {
    listener = do_GetWeakReference(listener);
   } catch (e) {
    throw Components.results.NS_ERROR_INVALID_ARG;
   }
   for (var i = 0; i < this.listeners.length; ++i) {
    if (this.listeners[i].listener == listener) {
     throw Components.results.NS_ERROR_FAILURE;
    }
   }
   this.listeners.push(new LoaderServiceListener(listener, mask));
  },
  removeProgressListener: function removeProgressListener(listener) {
   for (var i = 0; i < this.listeners.length; ++i) {
    if (this.listeners[i].listener == listener) {
     this.listeners.splice(i, 1);
     return;
    }
   }
   throw Components.results.NS_ERROR_FAILURE;
  },
  get DOMWindow() {
   throw Components.results.NS_ERROR_FAILURE;
  },
  get isLoadingDocument() {
   return false;
  },
  /* nsIDocumentLoader */
  stop: function stop(){},
  container: /* attribute */null,
  loadGroup: /* attribute */null,
  documentChannel: /* attribute */null,
  /* nsISecurityEventSink */
  onSecurityChange: function onSecurityChange(){
   for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i].listener;
    listener[arguments.callee.name].apply(listener, arguments);
   }
  },
  /* nsISupportsPriority */
  adjustPriority: function adjustPriority(){},
  /* nsIInterfaceRequestor */
  getInterface: GetInterface,
  /* nsIRequestObserver */
  onStartRequest: function onStartRequest(){
   for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i].listener;
    listener[arguments.callee.name].apply(listener, arguments);
   }
  },
  onStopRequest: function onStopRequest(){
   for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i].listener;
    listener[arguments.callee.name].apply(listener, arguments);
   }
  },
  /* nsIProgressEventSink */
  onProgress: function onProgress(){
   for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i].listener;
    listener[arguments.callee.name].apply(listener, arguments);
   }
  },
  onStatus: function onStatus(){
   for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i].listener;
    listener[arguments.callee.name].apply(listener, arguments);
   }
  },
  /* nsIChannelEventSink */
  onChannelRedirect: function onChannelRedirect(){
   for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i].listener;
    listener[arguments.callee.name].apply(listener, arguments);
   }
  },
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsIDocumentLoader,nsIWebProgress,nsISupportsWeakReference,nsISupports,nsISecurityEventSink,nsISupportsPriority,nsIInterfaceRequestor,nsIRequestObserver,nsIProgressEventSink,nsIChannelEventSink"),
  /* private */
  listeners: []
 }  
 /* "@mozilla.org/categorymanager;1" */
 function CategoryManager(){
  this.categories = {};
 }
 CategoryManager.prototype = {
  constructor: CategoryManager,
  /* nsICategoryManager */
  getCategoryEntry: function getCategoryEntry(category, entry) {
   if (!(category in this.categories))
    return null;
   category = this.categories[category];
   if (!(entry in category))
    return null;
   return category[entry];
  },
  addCategoryEntry: function addCategoryEntry(category, entry, value, persist, replace) {
   /* we ignore persist */
   if (!(category in this.categories)) {
    this.categories[category] = {};
   }
   category = this.categories[category];
   var old = '';
   if (entry in category) {
    old = category[entry];
    if (replace) {
     category[entry] = value;
     return old;
    }
   } else {
    category[entry] = value;
   }
   return old;
  },
  deleteCategoryEntry: function deleteCategoryEntry(category, title, persist) {
   if (!(category in this.categories))
    return;
   category = this.categories[category];
   if (!(title in category))
    return;
   delete category[title];
   /* we ignore persist */
  },
  deleteCategory: function deleteCategory(category) {
   if (!(category in this.categories))
    return;
   delete this.categories[category];
  },
  enumerateCategory: function enumerateCategory(category) {
   var entries = [];
   if (category in this.categories) {
    category = this.categories[category];
    for (var entry in category)
     entries.push(new SupportsCString(entry));
   }
   return new SimpleEnumerator(entries);
  },
  enumerateCategories: function enumerateCategories() {
   var categories = [];
   for (var category in this.categories)
    categories.push(new SupportsCString(category));
   return new SimpleEnumerator(categories);
  },
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsICategoryManager")
 };
 /* "@mozilla.org/embedcomp/window-watcher;1" */
 function nsEmbedcompWindowWatcher() {
  this.windows = [];
  this.observers = [];
 }
 nsEmbedcompWindowWatcher.prototype = {
  constructor: nsEmbedcompWindowWatcher,
  /* nsIAuthPromptAdapterFactory */
  createAdapter: function createAdapter(a0){
   return null;
  },
  /* nsIWindowWatcher */
  openWindow: function openWindow(parent, url, name, features, arguments){
   if (/\bwidth=(\d+)/i.test(features)) {
    var width = RegExp.$1;
   }
   if (/\bheight=(\d+)/i.test(features)) {
    var height = RegExp.$1;
   }
   var window = new Window(url, parent, name);
   this.addWindow(window, null);
   return window;
  },
  registerNotification: function registerNotification(observer){
   this.observers.push(observer);
  },
  unregisterNotification: function unregisterNotification(observer){
   for (var i = 0; i < this.observers.length; ++i) {
    if (this.observers[i] == observer) {
     this.observers.splice(i, 1);
     return;
    }
   }
  },
  getWindowEnumerator: function getWindowEnumerator(){
   return new SimpleEnumerator(this.windows);
  },
  getNewPrompter: function getNewPrompter(parent){
   return null;
  },
  getNewAuthPrompter: function getNewAuthPrompter(parent){
   return null;
  },
  setWindowCreator: function setWindowCreator(creator){
   this.windowCreator = creator.QueryInterface(Components.interfaces.nsIWindowCreator);
  },
  getChromeForWindow: function getChromeForWindow(window){
   for (var i = 0; i < this.chromeWindows.length; ++i) {
    if (this.chromeWindows[i].content == window)
     return this.chromeWindows[i];
   }
   return null;
  },
  getWindowByName: function getWindowByName(name, currentWindow){
   if (currentWindow) {
    /* need to search from here first */
   }
   for (var i = 0; i < this.windows.length; ++i) {
    if (this.windows[i].name == name)
     return this.windows[i];
   }
   return null;
  },
  activeWindow: /* attribute */null,
  /* [noscript] nsPIWindowWatcher */
  addWindow: function addWindow(window, chrome) {
   var newWindow = true;
   for (var i = 0; i < this.windows.length; ++i) {
    if (this.windows[i].name == window.name)
     newWindow = false;
   }
   this.windows.push(window);
   for (var j = 0; j < this.observers.length; ++j) try {
    this.observers[j].observe(window, "domwindowopened", "");
   } catch (e) {}
   if (!this.activeWindow)
    this.activeWindow = window;
   if (newWindow) {
    Components.classes["@mozilla.org/observer-service;1"]
              .getService(Components.interfaces.nsIObserverService)
              .notifyObservers(window, "toplevel-window-ready", "");
   }
  },
  removeWindow: function removeWindow(window) {
   for (var i = 0; i < this.windows.length; ++i) {
    if (this.windows[i] == window) {
     this.windows.splice(i, 1);
     for (var j = 0; j < this.observers.length; ++j) try {
      this.observers[j].observe(window, "domwindowclosed", "");
     } catch (e) {}
     if (window == this.activeWindow) {
      if (this.windows.length) {
       if (this.windows.length == i)
        --i;
       this.activeWindow = this.windows[i];
      } else {
       this.activeWindow = null;
      }
     }
     return;
    }
   }
  },
  openWindowJS: function openWindowJS(parent, url, name, features, dialog, argsArray) {
   var args = [];
   for (var i = 0; i < argsArray.length; ++i)
    args.push(argsArray.item(i));
   return this.openWindow(parent, url, name, features, args);
  },
  findItemWithName: function findItemWithName(name, requestor, originalRequestor) {
   return null;
  },
  /* nsIPromptFactory */
  getPrompt: function getPrompt(a0, a1){},
  /* nsISupports */
  interfaces: buildInterfaceList("nsIAuthPromptAdapterFactory,nsIWindowWatcher,nsPIWindowWatcher")
 }
 function ComponentManager(){
 }
 ComponentManager.prototype = {
  constructor: ComponentManager,
  toString: /*function() { return "[xpconnect wrapped nsIComponentManager]" }*/
   toString,
  QueryInterface: QueryInterface,
  /* nsIComponentRegistrar */
  autoRegister: function autoRegister(file) {
   var fileloc = file.path;
   var type;
   switch (file.leafName.replace(/^.*\./,'')) {
   case "js":
    type = "application/javascript";
    var module;
    if (!(evalcx instanceof Function)) {
     /* if we're unlucky - e.g. we're running in an old js shell
      * then we'll just have to share our top level world with the other file
      * it is possible to write some code which enumerates the global scope
      * and cleans it up before/after the calls to load/NSGetModule.
      *
      * however, to make that work, you need to worry about the case where those
      * variables are actually needed by the object later in life.
      */
     evalcx = function evalcx(kind) {
      return {
       NSGetModule: function NSGetModule() {
        var module = _parent_.NSGetModule.apply(_parent_, arguments);
        delete _parent_.NSGetModule;
        return module;
       }
      };
     }
    }
    var component_module;
    /* When the XPConnect Component Loader loads a module, it does it in its own Context.
     * a context looks something like this:
     *  Normal JavaScript Globals
     *  dump
     *  Components
     */
    component_module = evalcx('');
    component_module.dump = print;
    component_module.load = load;
    component_module.Components = Components;
    /* and then it loads the module
     */
    component_module.load(fileloc);
    /* and then it calls NSGetModule
     */
    module = component_module.NSGetModule(this,file);

    Components.modules[fileloc] = module;
    try {
     module.registerSelf(this, file, fileloc, type);
    } catch (e if e == Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN) {
     module.registerSelf(this, file, fileloc, type);
    }
    break;
   default:
    type = "application/x-unknown";
   }   
  },
  autoUnregister: function autoUnregister(file) {
  },
  registerFactory: function registerFactory(a,b,c,d) {
  },
  unregisterFactory: function unregisterFactory(a,b) {
  },
  registerFactoryLocation: function registerFactoryLocation(cid,classname,contractid,filespec,location,type) {
   Components.addClass(cid, Components.modules[location].getClassObject(this, cid, interfaces.nsIFactory), contractid);
  },
  unregisterFactoryLocation: function unregisterFactoryLocation(a,b) {
  },
  isCIDRegistered: function isCIDRegistered(cid) {
  },
  isContractIDRegistered: function isContractIDRegistered(contract) {
  },
  enumerateCIDs: function enumerateCIDs() {
  },
  enumerateContractIDs: function enumerateContractIDs() {
  },
  CIDToContractID: function CIDToContractID(cid) {
  },
  contractIDToCID: function contractIDToCID(contract) {
  },
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsIComponentManager,nsIComponentRegistrar")
 };
 function ComponentClass(contract, constructor) {
  this.contract = contract;
  this.fn = constructor;
  this.service = null;
 }
 ComponentClass.prototype = {
  constructor: ComponentClass,
  toString: function toString() {return this.contract;},
  xpcToString: toString,
  QueryInterface: QueryInterface,
  getService: function getService(iid) {
   if (!this.service)
    return this.service = this.createInstance(iid);

   for (var proto = this.service; proto.__proto__; proto = proto.__proto__);
   if (this.service.toString == proto.toString) {
    this.service.__proto__.toString = this.xpcToString;
   }

   if (!iid)
    iid = interfaces.nsISupports;
   return this.service.QueryInterface(iid);
  },
  createInstance: function createInstance(iid) {
   if (!iid)
    iid = interfaces.nsISupports;
   var instance = this.fn.createInstance(null, iid);
   for (var proto = instance; proto.__proto__; proto = proto.__proto__);
   if (instance.toString == proto.toString) {
    instance.__proto__.toString = this.xpcToString;
   }
   return instance.QueryInterface(iid);
  }
 };
 function nsXPCComponents_InterfacesByID(){}
 function nsXPCComponents_Classes(){}
 nsXPCComponents_Classes.prototype = {
  constructor: nsXPCComponents_Classes,
  toString: toString,
  QueryInterface: QueryInterface
 };
 function nsXPCComponents_ClassesByID(){}
 nsXPCComponents_ClassesByID.prototype = {
  constructor: nsXPCComponents_ClassesByID,
  toString: toString,
  QueryInterface: QueryInterface
 };
 function nsXPCComponents_Stack(line, deep) {
  this.caller = deep;
  this.sourceLine = "/* not available */";
  if (/^(.*)@(.*):(.*)/.test(line)) {
   this.name = RegExp.$1;
   this.fileName = RegExp.$2;
   this.lineNumber = RegExp.$3;
   if (this.name) {
     if (/(.*)\(\)/.test(this.name))
       this.name = RegExp.$1;
   } else {
    this.name = "<TOP_LEVEL>";
   }
  }
  if (selfFile == this.fileName) {
   this.language = Components.interfaces.nsIProgrammingLanguage.CPLUSPLUS;
  } else {
   this.language = Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT;
  }
 }
 var selfFile;
 try {
  null.null;
 } catch (e) {
  selfFile = e.filename;
 }
 nsXPCComponents_Stack.prototype = {
  constructor: nsXPCComponents_Stack,
  toString: function toString() {
   return this.languageName + " frame :: " +
          this.fileName + " :: " +
          this.name + " :: " +
          "line " + this.lineNumber;
  },
  QueryInterface: QueryInterface,
  get languageName() {
   switch (this.language) {
   case Components.interfaces.nsIProgrammingLanguage.CPLUSPLUS:
    return "C++";
   case Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT:
    return "JS";
   case Components.interfaces.nsIProgrammingLanguage.PYTHON:
    return "Python";
   case Components.interfaces.nsIProgrammingLanguage.PERL:
    return "Perl";
   case Components.interfaces.nsIProgrammingLanguage.JAVA:
    return "Java";
   case Components.interfaces.nsIProgrammingLanguage.ZX81_BASIC:
    return "ZX81_Basic";
   case Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT2:
    return "J2";
   case Components.interfaces.nsIProgrammingLanguage.RUBY:
    return "Ruby";
   case Components.interfaces.nsIProgrammingLanguage.PHP:
    return "PHP";
   case Components.interfaces.nsIProgrammingLanguage.TCL:
    return "TCL";
   default:
   case Components.interfaces.nsIProgrammingLanguage.UNKNOWN:
    return "Unknown";
   }
  }
 }
 function nsXPCComponents_Results(){}
 function nsXPCComponents_Utils() {}
 function nsXPCComponents_ID(id) { return new ID(id); } 
 function nsXPCComponents_Exception() {}
 function nsXPCComponents_Constructor(contract, iface, init) {
  var clazz = Components.classes[contract];
  function nsXPCConstructor() {
   var instance = clazz.createInstance();
   if (iface) {
    instance = instance.QueryInterface(iface);
    if (init) {
     instance[init].apply(instance, arguments);
    }
   }
   return instance;
  };
  nsXPCConstructor.toString = toString;
  nsXPCConstructor.prototype.QueryInterface = QueryInterface;
  return nsXPCConstructor;
 }
 nsXPCComponents_Constructor.toString = toString;
 function nsXPCComponents(){}
 var classes = new nsXPCComponents_Classes;
 var classesByID = new nsXPCComponents_ClassesByID;
 nsXPCComponents.prototype={
  constructor: nsXPCComponents,
  toString: toString,
  QueryInterface: QueryInterface,
  interfaces: interfaces,
  results: {
   constructor: nsXPCComponents_Results,
   toString: toString,
   NS_ERROR_XPC_NOT_ENOUGH_ARGS: 2153185281,
   NS_ERROR_XPC_NEED_OUT_OBJECT: 2153185282,
   NS_ERROR_XPC_CANT_SET_OUT_VAL: 2153185283,
   NS_ERROR_XPC_NATIVE_RETURNED_FAILURE: 2153185284,
   NS_ERROR_XPC_CANT_GET_INTERFACE_INFO: 2153185285,
   NS_ERROR_XPC_CANT_GET_PARAM_IFACE_INFO: 2153185286,
   NS_ERROR_XPC_CANT_GET_METHOD_INFO: 2153185287,
   NS_ERROR_XPC_UNEXPECTED: 2153185288,
   NS_ERROR_XPC_BAD_CONVERT_JS: 2153185289,
   NS_ERROR_XPC_BAD_CONVERT_NATIVE: 2153185290,
   NS_ERROR_XPC_BAD_CONVERT_JS_NULL_REF: 2153185291,
   NS_ERROR_XPC_BAD_OP_ON_WN_PROTO: 2153185292,
   NS_ERROR_XPC_CANT_CONVERT_WN_TO_FUN: 2153185293,
   NS_ERROR_XPC_CANT_DEFINE_PROP_ON_WN: 2153185294,
   NS_ERROR_XPC_CANT_WATCH_WN_STATIC: 2153185295,
   NS_ERROR_XPC_CANT_EXPORT_WN_STATIC: 2153185296,
   NS_ERROR_XPC_SCRIPTABLE_CALL_FAILED: 2153185297,
   NS_ERROR_XPC_SCRIPTABLE_CTOR_FAILED: 2153185298,
   NS_ERROR_XPC_CANT_CALL_WO_SCRIPTABLE: 2153185299,
   NS_ERROR_XPC_CANT_CTOR_WO_SCRIPTABLE: 2153185300,
   NS_ERROR_XPC_CI_RETURNED_FAILURE: 2153185301,
   NS_ERROR_XPC_GS_RETURNED_FAILURE: 2153185302,
   NS_ERROR_XPC_BAD_CID: 2153185303,
   NS_ERROR_XPC_BAD_IID: 2153185304,
   NS_ERROR_XPC_CANT_CREATE_WN: 2153185305,
   NS_ERROR_XPC_JS_THREW_EXCEPTION: 2153185306,
   NS_ERROR_XPC_JS_THREW_NATIVE_OBJECT: 2153185307,
   NS_ERROR_XPC_JS_THREW_JS_OBJECT: 2153185308,
   NS_ERROR_XPC_JS_THREW_NULL: 2153185309,
   NS_ERROR_XPC_JS_THREW_STRING: 2153185310,
   NS_ERROR_XPC_JS_THREW_NUMBER: 2153185311,
   NS_ERROR_XPC_JAVASCRIPT_ERROR: 2153185312,
   NS_ERROR_XPC_JAVASCRIPT_ERROR_WITH_DETAILS: 2153185313,
   NS_ERROR_XPC_CANT_CONVERT_PRIMITIVE_TO_ARRAY: 2153185314,
   NS_ERROR_XPC_CANT_CONVERT_OBJECT_TO_ARRAY: 2153185315,
   NS_ERROR_XPC_NOT_ENOUGH_ELEMENTS_IN_ARRAY: 2153185316,
   NS_ERROR_XPC_CANT_GET_ARRAY_INFO: 2153185317,
   NS_ERROR_XPC_NOT_ENOUGH_CHARS_IN_STRING: 2153185318,
   NS_ERROR_XPC_SECURITY_MANAGER_VETO: 2153185319,
   NS_ERROR_XPC_INTERFACE_NOT_SCRIPTABLE: 2153185320,
   NS_ERROR_XPC_INTERFACE_NOT_FROM_NSISUPPORTS: 2153185321,
   NS_ERROR_XPC_CANT_GET_JSOBJECT_OF_DOM_OBJECT: 2153185322,
   NS_ERROR_XPC_CANT_SET_READ_ONLY_CONSTANT: 2153185323,
   NS_ERROR_XPC_CANT_SET_READ_ONLY_ATTRIBUTE: 2153185324,
   NS_ERROR_XPC_CANT_SET_READ_ONLY_METHOD: 2153185325,
   NS_ERROR_XPC_CANT_ADD_PROP_TO_WRAPPED_NATIVE: 2153185326,
   NS_ERROR_XPC_CALL_TO_SCRIPTABLE_FAILED: 2153185327,
   NS_ERROR_XPC_JSOBJECT_HAS_NO_FUNCTION_NAMED: 2153185328,
   NS_ERROR_XPC_BAD_ID_STRING: 2153185329,
   NS_ERROR_XPC_BAD_INITIALIZER_NAME: 2153185330,
   NS_ERROR_XPC_HAS_BEEN_SHUTDOWN: 2153185331,
   NS_ERROR_XPC_CANT_MODIFY_PROP_ON_WN: 2153185332,
   NS_ERROR_XPC_BAD_CONVERT_JS_ZERO_ISNOT_NULL: 2153185333,
   NS_OK: 0,
   NS_ERROR_NOT_INITIALIZED: 3253927937,
   NS_ERROR_ALREADY_INITIALIZED: 3253927938,
   NS_ERROR_NOT_IMPLEMENTED: 2147500033,
   NS_NOINTERFACE: 2147500034,
   NS_ERROR_NO_INTERFACE: 2147500034,
   NS_ERROR_INVALID_POINTER: 2147500035,
   NS_ERROR_NULL_POINTER: 2147500035,
   NS_ERROR_ABORT: 2147500036,
   NS_ERROR_FAILURE: 2147500037,
   NS_ERROR_UNEXPECTED: 2147549183,
   NS_ERROR_OUT_OF_MEMORY: 2147942414,
   NS_ERROR_ILLEGAL_VALUE: 2147942487,
   NS_ERROR_INVALID_ARG: 2147942487,
   NS_ERROR_NO_AGGREGATION: 2147746064,
   NS_ERROR_NOT_AVAILABLE: 2147746065,
   NS_ERROR_FACTORY_NOT_REGISTERED: 2147746132,
   NS_ERROR_FACTORY_REGISTER_AGAIN: 2147746133,
   NS_ERROR_FACTORY_NOT_LOADED: 2147746296,
   NS_ERROR_FACTORY_NO_SIGNATURE_SUPPORT: 3253928193,
   NS_ERROR_FACTORY_EXISTS: 3253928192,
   NS_ERROR_PROXY_INVALID_IN_PARAMETER: 2147549200,
   NS_ERROR_PROXY_INVALID_OUT_PARAMETER: 2147549201,
   NS_BASE_STREAM_CLOSED: 2152136706,
   NS_BASE_STREAM_OSERROR: 2152136707,
   NS_BASE_STREAM_ILLEGAL_ARGS: 2152136708,
   NS_BASE_STREAM_NO_CONVERTER: 2152136709,
   NS_BASE_STREAM_BAD_CONVERSION: 2152136710,
   NS_BASE_STREAM_WOULD_BLOCK: 2152136711,
   NS_ERROR_FILE_UNRECOGNIZED_PATH: 2152857601,
   NS_ERROR_FILE_UNRESOLVABLE_SYMLINK: 2152857602,
   NS_ERROR_FILE_EXECUTION_FAILED: 2152857603,
   NS_ERROR_FILE_UNKNOWN_TYPE: 2152857604,
   NS_ERROR_FILE_DESTINATION_NOT_DIR: 2152857605,
   NS_ERROR_FILE_TARGET_DOES_NOT_EXIST: 2152857606,
   NS_ERROR_FILE_COPY_OR_MOVE_FAILED: 2152857607,
   NS_ERROR_FILE_ALREADY_EXISTS: 2152857608,
   NS_ERROR_FILE_INVALID_PATH: 2152857609,
   NS_ERROR_FILE_DISK_FULL: 2152857610,
   NS_ERROR_FILE_CORRUPTED: 2152857611,
   NS_ERROR_FILE_NOT_DIRECTORY: 2152857612,
   NS_ERROR_FILE_IS_DIRECTORY: 2152857613,
   NS_ERROR_FILE_IS_LOCKED: 2152857614,
   NS_ERROR_FILE_TOO_BIG: 2152857615,
   NS_ERROR_FILE_NO_DEVICE_SPACE: 2152857616,
   NS_ERROR_FILE_NAME_TOO_LONG: 2152857617,
   NS_ERROR_FILE_NOT_FOUND: 2152857618,
   NS_ERROR_FILE_READ_ONLY: 2152857619,
   NS_ERROR_FILE_DIR_NOT_EMPTY: 2152857620,
   NS_ERROR_FILE_ACCESS_DENIED: 2152857621,
   NS_ERROR_CANNOT_CONVERT_DATA: 2152071169,
   NS_ERROR_OBJECT_IS_IMMUTABLE: 2152071170,
   NS_ERROR_LOSS_OF_SIGNIFICANT_DATA: 2152071171,
   NS_SUCCESS_LOSS_OF_INSIGNIFICANT_DATA: 4587521
  },
  ID: nsXPCComponents_ID,
  classes: classes,
  classesByID: classesByID,
  get stack() {
   function forceException() {null.null};
   var exc;
   try {
    forceException();
   } catch (e) {
    exc = e;
   }
   var frames = exc.stack.split("\n");
   var frame = null;
   for (var i = frames.length - 1; i-- > 2; )
    frame = new nsXPCComponents_Stack(frames[i], frame);
   return frame;
  },
  manager: new ComponentManager,
  Constructor: nsXPCComponents_Constructor,
  /* private */
  addClass: function addClass(cid, constructor, contract) {
   if (!cid)
     cid = Math.randCID();
   var cc = new ComponentClass(contract, constructor);
   this.classesByID[cid] = cc;
   if (contract)
     this.classes[contract] = cc;
  },
  /* private */
  modules: {
  }
 };
 var Components = new nsXPCComponents;
 Components.addClass(null, new Factory(ObserverService), '@mozilla.org/observer-service;1');
 Components.addClass(null, new Factory(CategoryManager), '@mozilla.org/categorymanager;1');
 Components.addClass(null, new Factory(nsLocalFile), '@mozilla.org/file/local;1');
 Components.addClass(null, new Factory(DocLoaderService), '@mozilla.org/docloaderservice;1');
 Components.addClass(null, new Factory(AppStartupNotifier), '@mozilla.org/embedcomp/appstartup-notifier;1');
 Components.addClass(null, new Factory(nsEmbedcompWindowWatcher), "@mozilla.org/embedcomp/window-watcher;1");
 Components.addClass(null, new Factory(nsSupportsPRUint64), "@mozilla.org/supports-PRUint64;1");
 Components.addClass(null, new Factory(nsSupportsPRInt32), "@mozilla.org/supports-PRInt32;1");
 Components.addClass(null, new Factory(nsSupportsPRUint8), "@mozilla.org/supports-PRUint8;1");
 Components.addClass(null, new Factory(nsSupportsCstring), "@mozilla.org/supports-cstring;1");
 Components.addClass(null, new Factory(nsSupportsDouble), "@mozilla.org/supports-double;1");
 Components.addClass(null, new Factory(nsSupportsString), "@mozilla.org/supports-string;1");
 Components.addClass(null, new Factory(nsSupportsId), "@mozilla.org/supports-id;1");
 Components.addClass(null, new Factory(nsSupportsPRInt64), "@mozilla.org/supports-PRInt64;1");
 Components.addClass(null, new Factory(nsSupportsArray), "@mozilla.org/supports-array;1");
 Components.addClass(null, new Factory(nsSupportsFloat), "@mozilla.org/supports-float;1");
 Components.addClass(null, new Factory(nsSupportsPRInt16), "@mozilla.org/supports-PRInt16;1");
 Components.addClass(null, new Factory(nsSupportsInterfacePointer), "@mozilla.org/supports-interface-pointer;1");
 Components.addClass(null, new Factory(nsSupportsPRTime), "@mozilla.org/supports-PRTime;1");
 Components.addClass(null, new Factory(nsSupportsPRUint32), "@mozilla.org/supports-PRUint32;1");
 Components.addClass(null, new Factory(nsSupportsPRBool), "@mozilla.org/supports-PRBool;1");
 Components.addClass(null, new Factory(nsSupportsPRUint16), "@mozilla.org/supports-PRUint16;1");
 Components.addClass(null, new Factory(nsSupportsVoid), "@mozilla.org/supports-void;1");
 Components.addClass(null, new Factory(nsSupportsChar), "@mozilla.org/supports-char;1");
 var SupportsCString = Components.Constructor("@mozilla.org/supports-cstring;1", interfaces.nsISupportsCString, 'setData');
 function Collection() {
  this.list = [];
 }
 Collection.prototype = {
  constructor: Collection,
  toString: function toString() {
   return "[object HTMLCollection ("+this.list.length+")]";
  },
  get length() {
   return list.length;
  },
  namedItem: function namedItem(name) {
   for (var i = 0; i < this.list.length; ++i) {
    var item = this.item(i);
    if (item.getAttribute('name') == name)
     return item;
   }
   return null;
  },
  item: function item(i) {
   return i >= 0 && i < this.list.length ? this.list[i] : null;
  },
  push: function push(o) {
   this.list.push(o);
  },
  list: null
 }
 function DOM3Node(self) {
  this.self = self;
 }
 DOM3Node.prototype = {
  constructor: DOM3Node,
  toString: function () {
   return this.self.toString();
  },
  QueryInterface: function QueryInterface(iid) {
   if (interfaces.nsIDOM3Node.equals(iid))
    return this;
   return this.self.QueryInterface.apply(this.self, arguments);
  }
 }
 function DOMNode(name, space, attributes) {
  this.name = name;
  this.ns = space;
  this.children = null;
  if (!space ||
      space == NameSpaces.XHTML_NAMESPACE) {
   /* HTML */
  }
  if (!attributes)
   return;
  this.attributes = {};
  for (var i = 0; i < attributes.length; ++i) {
   var attrname = attributes[i].name;
   if (!this.attributes[attrname]) {
    this.attributes[attrname] = attributes[i];
   } else if (this.attributes[attrname] instanceof Collection) {
    this.attributes[attrname].push(attributes[attrname]);
   } else {
    var collection = new Collection;
    collection.push(this.attributes[attrname]);
    collection.push(attributes[i]);
    this.attributes[attrname] = collection;
   }
  }
 }
 DOMNode.prototype = {
  constructor: DOMNode,
  toString: function() {
   var tag = "<"+
    /*XXX:XMLNS*/
    this.name;
   if (this.attributes)
   for (var i in this.attributes) {
    if (this.attributes[i] instanceof Collection) {
     for (var j = 0; this.attributes[i].length; ++j)
      tag += " " + this.attributes[i].item(j);
    } else {
     tag += " " + this.attributes[i];
    }
   }
   tag += ">";
   return tag + this.innerHTML + "</" + this.name +">";
  },
  QueryInterface: function DOMNode_QueryInterface(iid) {
   if (interfaces.nsIDOM3Node.equals(iid))
    return new DOM3Node(this);
   return QueryInterface.apply(this, arguments);
  },
  get innerHTML() {
   var innerHTML = '';
   if (this.children)
   for (var i = 0; i < this.children.length; ++i) {
    innerHTML += this.children[i];
   }
   return innerHTML;
  },
  get firstChild() {
   if (!this.children ||
       !this.children.length) {
    return null;
   }
   return this.children[0];
  },
  get lastChild() {
   if (!this.children ||
       !this.children.length) {
    return null;
   }
   return this.children[this.children.length - 1];
  },
  get nextSibling() {
   if (!this.parent)
    return null;
   var siblings = this.parent.children;
   if (!siblings)
    return null;
   for (var i = 0; siblings[i] != this; i++);
   if (++i == siblings.length)
     return null;
   return siblings[i];
  },
  appendChild: function appendChild(node) {
   if (node == this) {
    throw "EEP";
   }
   if (node.parent) {
    throw "Don't do that!";
   }
   if (!this.children)
    this.children = [];
   this.children.push(node);
   node.parent = this;
  },
  removeChild: function removeChild(node) {
   if (!this.children) {
    /* XXX throw? */
    return;
   }
   for (var i = 0; i < this.children.length; ++i) {
    if (this.children[i] == node) {
     this.children.splice(i, 1);
     node.parent = null;
     return;
    }
   }
   /* XXX throw? */
  },
  hasAttribute: function hasAttribute(attr) {
   if (!this.attributes ||
       !this.attributes[attr])
    return false;
   return true;
  },
  getAttribute: function getAttribute(attr) {
   if (!this.attributes ||
       !this.attributes[attr])
    return "";
   return this.attributes[attr].value;
  },
  setAttribute: function getAttribute(attrname, value) {
   if (!this.attributes)
    this.attributes = {};
   var attr = new AttrNode(attrname, null, value);
   if (!this.attributes[attrname]) {
    this.attributes[attrname] = attr;
   } else if (this.attributes[attrname] instanceof Collection) {
    this.attributes[attrname].push(attr);
   } else {
    var collection = new Collection;
    collection.push(this.attributes[attrname]);
    collection.push(attr);
    this.attributes[attrname] = collection;
   }
  },
  removeAttribute: function removeAttribute(attrname) {
   if (!this.attributes)
    return;
   delete this.attributes[attrname];
  },
  name: "HTML",
  attributes: null,
  parent: null,
  interfaces: [
   interfaces.nsIDOMNode,
   interfaces.nsIDOM3Node,
  ]
 }
 function AttrNode(name, space, value){
  this.name = name;
  this.ns = space;
  this.value = value;
 }
 AttrNode.prototype = {
  constructor: AttrNode,
  toString: function toString() {
   var value = this.value;
   if (value == null) {
    /* XXX namespace */
    return this.name;
   }
   value = value.replace(/[<>&]/g, htmlEscape);
   if (/"/.test(value)) {
    value = value.replace(/"/g, "&quot;");
   }
   return this.name + '="' + value + '"';
  },
  __proto__ : DOMNode.prototype
 }
 function EntityNode(entity) {
  this.entity = entity;
 }
 EntityNode.prototype = {
  constructor: EntityNode,
  __proto__: DOMNode.prototype,
  toString: function toString() {
   /* there are two possible meanings of toString for now we're using the one that DOMNode.innerHTML expects */
   return this.innerHTML;
   return this.value;
  },
  get innerHTML() {
   return "&" + this.entity + ";";
  },
  value: ""
 }
 function TextNode(text){
  this.value = text;
 }
 TextNode.prototype = {
  constructor: TextNode,
  __proto__: DOMNode.prototype,
  toString: function toString() {
   /* there are two possible meanings of toString for now we're using the one that DOMNode.innerHTML expects */
   return this.innerHTML;
   return this.value;
  },
  get innerHTML() {
   return this.value.replace(/[<>&]/g, htmlEscape);
  },
  value: ""
 }
 function Frame() {
  /* inherit from DOMNode */
  this.__proto__.__proto__.constructor.apply(this, arguments);
 }
 Frame.prototype = {
  constructor: Frame,
  __proto__: DOMNode.prototype,
  get rows() {},
  set rows(rows) {},
  contentDocument: null
 }
 var NameSpaces = {
  XHTML_NAMESPACE: "http://www.w3.org/1999/xhtml"
 };
 function htmlEscape(a) {
  switch (a) {
  case "<":
   return "&lt;";
  case ">":
   return "&gt;";
  case "&":
   return "&amp;";
  default:
   return a;
  }
 }
 function parseAttributes(string) {
  var attrRe = /^\s*(?:([a-z][a-z0-9_-]*):|)([a-z][a-z0-9_-]*)\s*(=|$|\s)(.*)$/i;
  var attrValRe = /^\s*(?:"([^"]*)"|'([^']*)'|([^\s=<>]*))\s*(.*)$/;
  var attributes = [];
  var lastLen = string.length;
  while (string) {
   if (!attrRe.test(string))
    break;
   var ns = RegExp.$1;
   var attr = RegExp.$2;
   var operator = RegExp.$3;
   var value = '';
   string = RegExp.$4;
   if (operator == '=') {
    if (attrValRe.test(string)) {
     value = RegExp.$1 || RegExp.$2 || RegExp.$3;
     string = RegExp.$4;
    }
   }
   attributes.push(new AttrNode(attr, ns, value));
   if (lastLen == string.length)
    break;
   lastLen == string.length;
  }
  return {attributes: attributes, string: string};
 }
 function parseHTML(string, window, document) {
  string = string.replace(/\n/g, "&#xa;");
  /* we're making a parser, not rendering engine.
   * as such, residual style is *not* within our domain.
   * <b>ec<a><u>s</a>e</u></b>
   *
   * if you don't feed us well formed html, you get what you pay for.
   * the first matching tag will be used to close the tag stack
   * failed matching tags will be ignored
   *
   * correct concepts of block tags will probably not be applied.
   */
  var entRe = /^([^<&]*)&(#?[a-z][a-z0-9_-]*);?(.*)$/;
  var sgmlRe = /^([^<&]*)(<!.*)$/;
  var tagRe = /^([^<&]*)<(\/|)(?:([a-z][a-z0-9_-]*):|)([a-z][a-z0-9_-]*)(.*)/i;
  var lastLen = string.length;
  var container = new DOMNode("html");
  var curHead = new DOMNode("head");
  var curBody = new DOMNode("body");
  var curNode = container;
  var text = '';
  var htmlNode = null;
  var headNode = null;
  var bodyNode = null;
  var titleNode = null;
  var node;
  function appendText(text, kind) {
   /* text is only allowed in certain parts of the content model */
   if (!text)
    return;

   if (!kind)
    kind = TextNode;
   var node = new kind(text);
   switch (curNode.name) {
   case "title":
   case "script":
   case "style":
    curNode.appendChild(node);
    break;
   default:
    if (curBody)
     curBody.appendChild(node);
    else
     curNode.appendChild(node);
   }
  }
  while (string) {
   if (entRe.test(string)) {
    text = RegExp.$1;
    var ent = RegExp.$2;
    string = RegExp.$3;
    appendText(text, TextNode);
    appendText(ent, EntityNode);
   }
   if (sgmlRe.test(string)) {
    text = RegExp.$1;
    string = RegExp.$2;
    appendText(text);
    /* XXX break because I don't want to parse SGML! */
    break;
   }
   if (tagRe.test(string)) {
    text = RegExp.$1;
    var close = RegExp.$2;
    var ns = RegExp.$3;
    var name = RegExp.$4;
    string = RegExp.$5;
    var attrs = parseAttributes(string);
    string = attrs.string;
    if (/^>(.*)/.test(string))
     string = RegExp.$1;
    appendText(text);
    if (close) {
     for (var closeNode = curNode;
          closeNode.name != name &&
           closeNode.parent;
          closeNode = closeNode.parent);
     if (closeNode.name == name)
      curNode = closeNode.parent;
    } else {
     var newNode = new DOMNode(name, ns, attrs.attributes);
     switch (name) {
     case "html":
      if (!htmlNode)
       htmlNode = newNode;
       while ((node = container.firstChild)) {
        container.removeChild(node);
        htmlNode.appendChild(node);
       }
       if (curNode == container)
        curNode = htmlNode;
       container = htmlNode;
       newNode = null;
      break;
     case "head":
      if (!headNode)
       headNode = newNode;
      curHead = null;
      break;
     case "body":
     case "frameset":
      if (!bodyNode)
       bodyNode = newNode;
      if (curBody)
       curBody = null;
      break;
     case "frame":
      newNode.__proto__ = Frame.prototype;
      /* need to parse the locations */
      newNode.contentWindow = new Window(newNode.getAttribute("src"), window);
      newNode.contentDocument = newNode.contentWindow.document;
      curNode.appendChild(newNode);
      newNode = null;
      break;
     case "form":
      document.forms.push(newNode);
      break;
     case "title":
      if (!titleNode)
       titleNode = newNode;
      break;
     }
     if (newNode) {
      curNode.appendChild(newNode);
      curNode = newNode;
     }
    }
   }
   if (lastLen == string.length) {
    appendText(string);
    break;
   }
   lastLen = string.length;
  }
  if (curHead) {
   if (bodyNode) {
    container.removeChild(bodyNode);
    container.appendChild(curHead);
    container.appendChild(bodyNode);
   } else {
    container.appendChild(curHead);
   }
   curHead = null;
  }
  if (curBody) {
   container.appendChild(curBody);
   bodyNode = curBody;
   curBody = null;
  }
  document.body = bodyNode;
  return container;
 }
 function Document(url, window) {
  if (/^(data:([^;,]+)(?:;([^,]*)|),)/.test(url)) {
   var string = RegExp.$1;
   var kind = RegExp.$2;
   var encoding = RegExp.$3;
   var data = url.substring(string.length);
   var innerHTML = data;
   switch (encoding) {
    default:
   }
   switch (kind) {
   case "text/plain":
    innerHTML = innerHTML.replace(/[<>&]/g, htmlEscape);
    break;
   case "text/html":
    break;
   default:
print("unrecog!");
   }
   this.defaultView = window;
   this.forms = new Collection;
   this.documentElement = parseHTML(innerHTML, window, this);
  }
 }
 Document.prototype = {
  constructor: Document,
  toString: function() {
   return "[Document {"+this.documentElement+"}]";
  },
  QueryInterface: QueryInterface,
  getInterface: getInterface,
  addEventListener: NOP,
  removeEventListener: NOP,
  getElementsByTagNameNS: function getElementsByTagNameNS(namespace, tag) {
   debug(arguments);
   return [];
  },
  documentElement: null
 }
 function Window(url, parent, name, width, height) {
  switch (arguments.length) {
  case 0:
   url = "data:text/plain,"+Math.randInt(100);
  case 1:
   parent = null;
  case 2:
   name = '';
  case 3:
   width = Math.randInt(1000);
  case 4:
   height = Math.randInt(10000);
  }
  this.location = url;
  this.parent = this.sameTypeParent = parent;
  this.name = name;
  this.width = width;
  this.height = height;
  this.document = new Document(url, this);
 }
 Window.prototype = {
  constructor: Window,
  QueryInterface: QueryInterface,
  getInterface: function getInterface() {return this},
  get url(){return this.location.href},
  toString: function toString(){return "[Window ("+this.width+'x'+this.height+") "+this.url+"]"},
  set location(url){this._location = new Location(url); return url},
  get location(){return this._location},
  close: function close() {
   if (!this.closed && !this.parent) {
    Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
              .getService(Components.interfaces.nsIWindowWatcher)
              .removeWindow(this);
   }
   this.closed = true;
  },
  closed: false
 };
 function Location(href) {
  this.href = href;
 }
 Location.prototype = {
  constructor: Location,
  toString: function toString() {return this.href},
  QueryInterface: QueryInterface
 };
 function nsLocalFile() {
 }
 nsLocalFile.prototype = {
  constructor: nsLocalFile,
  toString: toString,
  QueryInterface: QueryInterface,
  /* XXX nsIFile! */
  NORMAL_FILE_TYPE: 0,
  DIRECTORY_TYPE: 1,
  /* nsIFile */
  append: function append(path) {
   delete this._parent;
   this._path += '/' + path;
  },
  normalize: function normalize(){},
  create: function create(type, permissions) {
   switch (type) {
    case this.NORMAL_FILE_TYPE:
     this._directory = false;
     this._file = true;
     break;
    case this.DIRECTORY_TYPE:
     this._directory = true;
     this._file = false;
     break;
    default:
     throw Components.results.NS_ERROR_FILE_UNKNOWN_TYPE;
   }
   this._exists = true;
   return;
  },
  get leafName() {
   if (/([^\/]+)$/.test(this._path))
    return RegExp.$1;
   return this._path;
  },
  copyTo: function copyTo(parent, newName) {
   if (parent) {
    if (!parent.exists())
     throw Components.results.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST;
    if (!parent.isDirectory())
     throw Components.results.NS_ERROR_FILE_DESTINATION_NOT_DIR;
   }
  },
  copyToFollowingLinks: function copyToFollowingLinks(parent, newName) {
   return this.copyTo(parent, newName);
  },
  moveTo: function moveTo(parent, newName) {
   if (parent) {
    if (!parent.exists())
     throw Components.results.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST;
    if (!parent.isDirectory())
     throw Components.results.NS_ERROR_FILE_DESTINATION_NOT_DIR;
   }
   if (this.isDirectory()) {
    if (parent.directoryEntryies.hasMoreElements())
     throw Components.results.NS_ERROR_FILE_DIR_NOT_EMPTY;
   }
   if (!parent.isWritable())
     throw Components.results.NS_ERROR_FILE_ACCESS_DENIED;
  },
  remove: function remove(recursive) {
   if (!this.exists()) {
    /* throw? */
    return;
   }
   if (!recursive &&
       this.isDirectory() &&
       this.directoryEntries.hasMoreElements())
    throw Components.results.NS_ERROR_FILE_DIR_NOT_EMPTY;
  },
  permissions: 0,
  permissionsOfLink: 0,
  lastModifiedTime: 0,
  lastModifiedTimeOfLink: 0,
  fileSize: 0,
  fileSizeOfLink: 0,
  get target() {
   if (!this.exists())
    throw Components.results.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST;
   if (!this.isSymLink())
    throw Components.results.NS_ERROR_FILE_INVALID_PATH;
   return this._target;
  },
  get path() {
   return this._path;
  },
  exists: function exists() {
   return this._exists;
  },
  isWritable: function isWritable() {
   return !!(this.permissions & 0222);
  },
  isReadable: function isReadable() {
   return !!(this.permissions & 0444);
  },
  isExecutable: function isExecutable() {
   return !!(this.permissions & 0111);
  },
  isHidden: function isHidden() {
   if (this._hidden)
    return true;
   return /^\./.test(this.leafName);
  },
  isDirectory: function isDirectory() {
   if (this._file)
    return false;
   return this._directory;
  },
  isFile: function isFile() {
   if (this._directory)
    return false;
   return this._file;
  },
  isSymLink: function isSymLink() {
   if (this._symLink)
    return true;
   return /\.(?:pif|lnk|url)$/.test(this.leafName);
  },
  isSpecial: function isSpecial() {
   return this._special;
  },
  createUnique: function createUnique(type, permissions) {
   return this.create(type, permissions);
  },
  clone: function clone() {
   var clone = new this.constructor();
   clone.initWithPath(this.path);
   return clone;
  },
  equals: function equals(file) {
   return this.path == file.path;
  },
  contains: function contains(file, recurse) {
   var filePath = file.path;
   if (filePath.length <= this._path.length)
    return false;
   if (this._path.substr(0, filePath.length) != filePath)
    return false;
   if (!recurse && /.+[\/]/.test(this._path.substr(filePath.length)))
    return false;
   return true;
  },
  get parent() {
   if (this._parent === undefined) {
    this._parent = null;
    if (this._path.length > 3) {
     var parentPath = this._path.replace(/\/[^\/]*$/,"");
     if (parentPath.length == 2)
      parentPath += "/";
     this._parent = new this.constructor(parentPath);
    }
   }
   return this._parent;
  },
  get directoryEntries() {
   if (!this.exists())
    throw Components.results.NS_ERROR_FILE_TARGET_DOES_NOT_EXIST;
   if (!this.isDirectory())
    throw Components.results.NS_ERROR_FILE_NOT_DIRECTORY;
   return new SimpleEnumerator;
  },
  /* nsILocalFile */
  initWithPath: function initWithPath(path) {
   this._path = path;
   delete this._parent;
  },
  initWithFile: function initWithFile(file) {
   this._path = file.path;
   delete this._parent;
   this.permissions = file.permissions;
   this.permissionsOfLink = file.permissionsOfLink;
   this.lastModifiedTime = file.lastModifiedTime;
   this.lastModifiedTimeOfLink = file.lastModifiedTimeOfLink;
   this.fileSize = file.fileSize;
   this.fileSizeOfLink = file.fileSizeOfLink;
   this._exists = file.exists();
   if (this._exists) {
    this._special = file.isSpecial();
    this._directory = file.isDirectory();
    this._file = file.isFile();
    this._hidden = file.isHidden();
    this._symlink = file.isSymLink();
    this._target = file.target;
   }
  },
  followLinks: false,
  get diskSpaceAvailable() { return 0; },
  get persistentDescriptor() { throw Components.results.NS_ERROR_NOT_IMPLEMENTED; },
  set persistentDescriptor(desc) { throw Components.results.NS_ERROR_NOT_IMPLEMENTED; },
  reveal: function reveal() {},
  launch: function launch() {},
  getRelativeDescriptor: function getRelativeDescriptor(other) { throw Components.results.NS_ERROR_NOT_IMPLEMENTED; },
  setRelativeDescriptor: function setRelativeDescriptor(other, desc) { throw Components.results.NS_ERROR_NOT_IMPLEMENTED; },
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsIFile,nsILocalFile")
 }

 /* "@mozilla.org/timer;1" */
 function nsTimer() {}
 nsTimer.prototype = {
  constructor: nsTimer,
  toString: toString,
  QueryInterface: QueryInterface,
  /* nsITimer */
  init: function init(){},
  initWithCallback: function initWithCallback(){},
  cancel: function cancel(){},
  /* nsIClassInfo */
  interfaces: buildInterfaceList("nsITimer")
 }
 var globals = {
  Components: Components,
  Window: Window,
  DOMNode: DOMNode,
  TextNode: TextNode
 };
 if (typeof(dump) != 'function')
  globals.dump = print;
 for (var global in globals) {
  this[global] = globals[global];
 }
})();

function testWorld(){
 /* this is a test world */
 this.rootWindow = 
  Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
            .getService(Components.interfaces.nsIWindowWatcher)
            .openWindow(null,
  'data:text/html,'+
   "<frameset rows='*,*'>"+
    '<frame src="data:text/html,top">'+
    "<frameset cols='*,*'>"+
     '<frame src="data:text/html,bottom left">'+
     '<frame src="data:text/html,bottom right">'+
    '</frameset>'+
   '</frameset>',
  "my_root",
  "",
  null
 );
}

function drive(fileloc){
 var LocalFile = Components.Constructor("@mozilla.org/file/local;1",Components.interfaces.nsILocalFile,"initWithPath");
 if (!fileloc)
  fileloc = "./merge-frames.js";
 var filespec = new LocalFile(fileloc);
 Components.manager.autoRegister(filespec);
}
function startup(){
 Components.classes['@mozilla.org/embedcomp/appstartup-notifier;1'].createInstance(Components.interfaces.nsIObserver).observe(null, 'app-startup', null);
}

testWorld();
drive();
startup();
void(0);
