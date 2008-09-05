pref("extensions.getAddons.showPane", true);
pref("extensions.getAddons.browseAddons", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%");
pref("extensions.getAddons.maxResults", 5);
pref("extensions.getAddons.recommended.browseURL", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/recommended");
pref("extensions.getAddons.recommended.url", "https://services.addons.mozilla.org/%LOCALE%/%APP%/api/%API_VERSION%/list/featured/all/10/%OS%/%VERSION%");
pref("extensions.getAddons.search.browseURL", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/search?q=%TERMS%");
pref("extensions.getAddons.search.url", "https://services.addons.mozilla.org/%LOCALE%/%APP%/api/%API_VERSION%/search/%TERMS%/all/10/%OS%/%VERSION%");
pref("extensions.blocklist.enabled", true);
pref("extensions.blocklist.interval", 86400);
pref("extensions.blocklist.url", "https://addons.mozilla.org/blocklist/2/%APP_ID%/%APP_VERSION%/%PRODUCT%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/%CHANNEL%/%OS_VERSION%/%DISTRIBUTION%/%DISTRIBUTION_VERSION%/");
pref("extensions.blocklist.detailsURL", "http://%LOCALE%.www.mozilla.com/%LOCALE%/blocklist/");
pref("browser.dictionaries.download.url", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/firefox/%VERSION%/dictionaries/");
pref("app.update.enabled", true);
pref("app.update.auto", false);
pref("app.update.mode", 1);
pref("app.update.silent", false);
pref("app.update.url", "https://aus2.mozilla.org/update/3/%PRODUCT%/%VERSION%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/%CHANNEL%/%OS_VERSION%/%DISTRIBUTION%/%DISTRIBUTION_VERSION%/update.xml");
pref("app.update.interval", 86400);
pref("app.update.nagTimer.restart", 86400);
pref("app.update.timer", 600000);
pref("app.update.promptWaitTime", 43200);
pref("app.update.idletime", 60);
pref("app.update.showInstalledUI", false);
pref("app.update.incompatible.mode", 0);
pref("extensions.update.enabled", true);
pref("extensions.update.url", "https://versioncheck.addons.mozilla.org/update/VersionCheck.php?reqVersion=%REQ_VERSION%&id=%ITEM_ID%&version=%ITEM_VERSION%&maxAppVersion=%ITEM_MAXAPPVERSION%&status=%ITEM_STATUS%&appID=%APP_ID%&appVersion=%APP_VERSION%&appOS=%APP_OS%&appABI=%APP_ABI%&locale=%APP_LOCALE%");
pref("extensions.update.interval", 86400);  // Check for updates to Extensions and 
pref("extensions.getMoreExtensionsURL", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/%VERSION%/extensions/");
pref("extensions.getMoreThemesURL", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/%VERSION%/themes/");
pref("extensions.getMorePluginsURL", "https://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/%VERSION%/plugins/");
pref("extensions.dss.enabled", false);          // Dynamic Skin Switching                                               
pref("extensions.dss.switchPending", false);    // Non-dynamic switch pending after next
pref("xpinstall.whitelist.add", "update.mozilla.org");
pref("xpinstall.whitelist.add.103", "addons.mozilla.org");
pref("keyword.enabled", true);
pref("keyword.URL", "chrome://browser-region/locale/region.properties");
pref("general.skins.selectedSkin", "classic/1.0");
pref("snav.keyCode.modifier", 0);
