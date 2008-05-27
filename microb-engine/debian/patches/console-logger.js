/* components defined in this file */
const CONSOLE_LOGGER_CTRID =
    "@mozilla.org/xpcom/console-logger;1";
const CONSOLE_LOGGER_CID =
    Components.ID("{18269616-1dd2-11b2-afa8-b612439bda28}");

/* components used by this file */
const CATMAN_CTRID = "@mozilla.org/categorymanager;1";
const STRING_STREAM_CTRID = "@mozilla.org/io/string-input-stream;1";
const MEDIATOR_CTRID =
    "@mozilla.org/appshell/window-mediator;1";
const ASS_CONTRACTID =
    "@mozilla.org/appshell/appShellService;1";
const SIMPLEURI_CTRID = "@mozilla.org/network/simple-uri;1";
const LOCAL_FILE_CTRID = "@mozilla.org/file/local;1";
const OUTPUT_STR_CTRID = "@mozilla.org/network/file-output-stream;1";

const nsICategoryManager   = Components.interfaces.nsICategoryManager;
const nsIContentHandler    = Components.interfaces.nsIContentHandler;
const nsIURI               = Components.interfaces.nsIURI;
const nsIURL               = Components.interfaces.nsIURL;
const nsIStringInputStream = Components.interfaces.nsIStringInputStream;
const nsIChannel           = Components.interfaces.nsIChannel;
const nsIRequest           = Components.interfaces.nsIRequest;
const nsIProgressEventSink = Components.interfaces.nsIProgressEventSink;
const nsISupports          = Components.interfaces.nsISupports;
const nsILocalFile         = Components.interfaces.nsILocalFile;
const nsIFileOutputStream  = Components.interfaces.nsIFileOutputStream;

var LocalFile = Components.Constructor(LOCAL_FILE_CTRID, nsILocalFile, "initWithPath");
var OutputStream = Components.Constructor(OUTPUT_STR_CTRID, nsIFileOutputStream, "init");
var log;

function Trace()
{

    function setupLoggers() {
        var prlog = {log:(function () {})}, mclog;
        mclog = dump;
        try {
        } catch (e) {
        }
        log = (function log(module, level, message) {message = module + ":" + level + "	" + message;mclog(message);});
        maybeBreak = function(){};
    }

    setupLoggers();

    var logger = (typeof log != "undefined") ? log : (function (a, b, c) {dump([a, b, c].toString());});
    var trace = (function trace(args) {maybeBreak();function toArray(ary) {var o = new trace.Array(), i;for (i = 0; i < ary.length; ++i) {o[i] = ary[i];}return o;}function stack() {try {var stackArray = [];var Stack = Components.stack.caller.caller;while (Stack) {stackArray.push(Stack.toString());Stack = Stack.caller;}} catch (e) {}return stackArray;}logger("jsconsole", 5, args.callee.name + "(" + toArray(args) + "){/*" + stack().join("\n") + "*/\r\n");});
    trace.Array = Array;
    return trace;
}
var trace = Trace();

/* Command Line handler service */
function CLoggerService()
{
}

CLoggerService.prototype = {
  constructor: CLoggerService,
  cs: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
  os: Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService),
  ps: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
  logfile: null,
  /*nsIObserver*/
  observe: function CLoggerService_observe(aSubject, aTopic, aData)
  {
    if (arguments.length == 1) {
      this.consoleListener.owner = this;
      this.consoleListener.observe.apply(this.consoleListener, arguments);
      return;
    }
    switch (aTopic){
    case "timer-callback":
      break;
    case "app-startup":
      this.ps.QueryInterface(Components.interfaces.nsIPrefBranchInternal).addObserver("browser.consolelogfile", this, false);
      this.ps.addObserver("profile-after-change", this, false);
      this.observe("", "nsPref:changed", null);
      break;
    case "xpcom-shutdown":
      this.os.removeObserver(this, "profile-after-change");
      this.ps.removeObserver("profile-after-change", this);
      break;
    case "nsPref:changed":
    case "domwindowopened":
    case "profile-after-change":
      if (this.logfile == null)
        this.cs.registerListener(this);
      try {
        this.logfile = this.ps.getBranch("browser.").getCharPref("consolelogfile");
      } catch (e) {
        this.logfile = false;
      }
      break;
    default:
    }
  },
  consoleListener: {
    constructor: function consoleListener(){},
    QueryInterface: function consoleListener_QueryInterface(aIID)
    {
      if (aIID.equals(Components.interfaces.nsIConsoleListener))
        return this;
      return this.owner.QueryInterface(aIID);
    },
    /*nsIConsoleListener*/
    observe: function consoleListener_observe(aObject)
    {
      if (!aObject.message) return;

      if (aObject instanceof Components.interfaces.nsIScriptError) {
        // filter chrome urls
        var nsIScriptError = Components.interfaces.nsIScriptError;
          
        // Is this error actually just a non-fatal warning?
        var warning = aObject.flags & nsIScriptError.warningFlag != 0;
        row = {};
        var typetext = warning ? "typeWarning" : "typeError";
        row["typetext"] = this.mStrBundle ? this.mStrBundle.getString(typetext) : typetext;
        row["type"] = warning ? "warning" : "error";
        row["msg"] = aObject.message;
        if (aObject.lineNumber || aObject.sourceName) {
          row["url"] = aObject.sourceName;
          row["line"] = aObject.lineNumber;
        } else {
          row["hideSource"] = "true";
        }
        if (aObject.sourceLine) {
          row["code"] = aObject.sourceLine.replace("\n", "", "g");
          if (aObject.columnNumber) {
            row["col"] = aObject.columnNumber;
/*            row["errorDots"] = this.repeatChar(" ", aObject.columnNumber); */
            row["errorCaret"] = " ";
          } else {
            row["hideCaret"] = "true";
          }
        } else {
          row["hideCode"] = "true";
        }
      } else if (aObject instanceof Components.interfaces.nsIConsoleMessage) {
        row["type"] = "message";
        row["msg"] = aObject.message;
      } else {
        row["type"] = "message";
        row["msg"] = aObject;
      }
      this.owner.dolog(uneval(row)+"\r\n");
    }
  },
  /*nsISupports*/
  QueryInterface: function CLoggerService_QueryInterface(aIID)
  {
    if (aIID.equals(Components.interfaces.nsIObserver) ||
        aIID.equals(Components.interfaces.nsISupports))
      return this;
    if (aIID.equals(Components.interfaces.nsIConsoleListener)) {
      this.consoleListener.owner = this;
      return this.consoleListener;
    }
    Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
    return null;
  },
  dolog: function dolog(message) {
    try {
      var file = new LocalFile(this.logfile);
      var out = OutputStream(file, 0x1a, 0664, 0);
      out.write(message, message.length);
      out.close();
      file = null;
      out = null;
    } catch (e) {
    }
  }
}

/* factory for command line handler service (CLoggerService) */
var CLoggerFactory = new Object();

CLoggerFactory.createInstance =
function clf_create (outer, iid)
{
  if (outer)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

  return new CLoggerService().QueryInterface(iid);
}

/*****************************************************************************/

var Module = new Object();

Module.registerSelf =
function registerSelf(compMgr, fileSpec, location, type)
{
  this.mContractID = CONSOLE_LOGGER_CTRID;
  this.mCategory = "ConsoleLogger";
  if (compMgr instanceof Components.interfaces.nsIComponentRegistrar)
    compMgr.registerFactoryLocation(CONSOLE_LOGGER_CID,
                                    "Console Logger",
                                    this.mContractID, 
                                    fileSpec,
                                    location, 
                                    type);

  catman = Components.classes[CATMAN_CTRID].getService(nsICategoryManager);
  catman.addCategoryEntry("app-startup", this.mCategory, "service," + this.mContractID, true, true);
}

Module.unregisterSelf =
function unregisterSelf(compMgr, fileSpec, location)
{
  compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  compMgr.unregisterFactoryLocation(CONSOLE_LOGGER_CID, fileSpec);
  catman = Components.classes[CATMAN_CTRID].getService(nsICategoryManager);
    catman.deleteCategoryEntry("app-startup", this.mCategory, true);
}

Module.getClassObject =
function getClassObject(compMgr, cid, iid)
{
  if (!iid.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

  if (cid.equals(CONSOLE_LOGGER_CID))
    return CLoggerFactory;

  throw Components.results.NS_ERROR_NO_INTERFACE;
}

Module.canUnload =
function canUnload(compMgr)
{
  return true;
}

/* entrypoint */
function NSGetModule(compMgr, fileSpec)
{
  return Module;
}
