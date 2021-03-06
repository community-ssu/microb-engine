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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Dave Townsend <dtownsend@oxymoronical.com>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2008
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
 * the terms of any one of the MPL, the GPL or the LGPL
 *
 * ***** END LICENSE BLOCK *****
 */

const BLOCKLIST_TIMER                 = "blocklist-background-update-timer";
const PREF_BLOCKLIST_URL              = "extensions.blocklist.url";
const PREF_BLOCKLIST_ENABLED          = "extensions.blocklist.enabled";
const PREF_APP_DISTRIBUTION           = "distribution.id";
const PREF_APP_DISTRIBUTION_VERSION   = "distribution.version";
const PREF_APP_UPDATE_CHANNEL         = "app.update.channel";
const PREF_GENERAL_USERAGENT_LOCALE   = "general.useragent.locale";
const CATEGORY_UPDATE_TIMER           = "update-timer";

// Get the HTTP server.
do_load_httpd_js();
var testserver;
var gOSVersion;
var gBlocklist;

// This is a replacement for the timer service so we can trigger timers
var timerService = {

  hasTimer: function(id) {
    var catMan = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
    var entries = catMan.enumerateCategory(CATEGORY_UPDATE_TIMER);
    while (entries.hasMoreElements()) {
      var entry = entries.getNext().QueryInterface(Components.interfaces.nsISupportsCString).data;
      var value = catMan.getCategoryEntry(CATEGORY_UPDATE_TIMER, entry);
      var timerID = value.split(",")[2];
      if (id == timerID) {
        return true;
      }
    }
    return false;
  },

  fireTimer: function(id) {
    gBlocklist.QueryInterface(Components.interfaces.nsITimerCallback).notify(null);
  },

  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIUpdateTimerManager)
     || iid.equals(Components.interfaces.nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

var TimerServiceFactory = {
  createInstance: function (outer, iid) {
    if (outer != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return timerService.QueryInterface(iid);
  }
};
var registrar = Components.manager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
registrar.registerFactory(Components.ID("{61189e7a-6b1b-44b8-ac81-f180a6105085}"), "TimerService",
                          "@mozilla.org/updates/timer-manager;1", TimerServiceFactory);

function failHandler(metadata, response) {
  do_throw("Should not have attempted to retrieve the blocklist when it is disabled");
}

function pathHandler(metadata, response) {
  var ABI = "noarch-spidermonkey";
  // the blacklist service special-cases ABI for Universal binaries,
  // so do the same here.
  if ("@mozilla.org/xpcom/mac-utils;1" in Components.classes) {
    var macutils = Components.classes["@mozilla.org/xpcom/mac-utils;1"]
                             .getService(Components.interfaces.nsIMacUtils);
    if (macutils.isUniversalBinary)
      ABI = "Universal-gcc3";
  }
  do_check_eq(metadata.queryString,
              "xpcshell@tests.mozilla.org&1&XPCShell&1&2007010101&" +
              "XPCShell_" + ABI + "&locale&updatechannel&" +
              gOSVersion + "&1.9&distribution&distribution-version");
  gBlocklist.observe(null, "quit-application", "");
  gBlocklist.observe(null, "xpcom-shutdown", "");
  testserver.stop(do_test_finished);
}

function run_test() {
  var osVersion;
  var sysInfo = Components.classes["@mozilla.org/system-info;1"]
                          .getService(Components.interfaces.nsIPropertyBag2);
  try {
    osVersion = sysInfo.getProperty("name") + " " + sysInfo.getProperty("version");
    if (osVersion) {
      try {
        osVersion += " (" + sysInfo.getProperty("secondaryLibrary") + ")";
      }
      catch (e) {
      }
      gOSVersion = encodeURIComponent(osVersion);
    }
  }
  catch (e) {
  }

  createAppInfo("xpcshell@tests.mozilla.org", "XPCShell", "1", "1.9");

  testserver = new nsHttpServer();
  testserver.registerPathHandler("/1", failHandler);
  testserver.registerPathHandler("/2", pathHandler);
  testserver.start(4444);

  // Initialise the blocklist service
  gBlocklist = Components.classes["@mozilla.org/extensions/blocklist;1"]
                         .getService(Components.interfaces.nsIBlocklistService)
                         .QueryInterface(Components.interfaces.nsIObserver);
  gBlocklist.observe(null, "profile-after-change", "");

  do_check_true(timerService.hasTimer(BLOCKLIST_TIMER));

  do_test_pending();

  // This should have no effect as the blocklist is disabled
  gPrefs.setCharPref(PREF_BLOCKLIST_URL, "http://localhost:4444/1");
  gPrefs.setBoolPref(PREF_BLOCKLIST_ENABLED, false);
  timerService.fireTimer(BLOCKLIST_TIMER);

  // Some values have to be on the default branch to work
  var defaults = gPrefs.QueryInterface(Components.interfaces.nsIPrefService)
                       .getDefaultBranch(null);
  defaults.setCharPref(PREF_APP_UPDATE_CHANNEL, "updatechannel");
  defaults.setCharPref(PREF_APP_DISTRIBUTION, "distribution");
  defaults.setCharPref(PREF_APP_DISTRIBUTION_VERSION, "distribution-version");
  defaults.setCharPref(PREF_GENERAL_USERAGENT_LOCALE, "locale");

  // This should correctly escape everything
  gPrefs.setCharPref(PREF_BLOCKLIST_URL, "http://localhost:4444/2?" +
                     "%APP_ID%&%APP_VERSION%&%PRODUCT%&%VERSION%&%BUILD_ID%&" +
                     "%BUILD_TARGET%&%LOCALE%&%CHANNEL%&" +
                     "%OS_VERSION%&%PLATFORM_VERSION%&%DISTRIBUTION%&%DISTRIBUTION_VERSION%");
  gPrefs.setBoolPref(PREF_BLOCKLIST_ENABLED, true);
  timerService.fireTimer(BLOCKLIST_TIMER);
}
