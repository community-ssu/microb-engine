/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Benjamin Smedberg <bsmedberg@covad.net>
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

/* The prefs in this file are shipped with the GRE and should apply to all
 * embedding situations. Application-specific preferences belong somewhere else,
 * for example xpfe/bootstrap/browser-prefs.js
 *
 * Platform-specific #ifdefs at the end of this file override the generic
 * entries at the top.
 */

// SYNTAX HINTS:  dashes are delimiters.  Use underscores instead.
//  The first character after a period must be alphabetic.

//pref("keyword.URL", "http://www.google.com/search?ie=UTF-8&oe=utf-8&q=");
pref("keyword.URL", "http://www.google.com/search?ie=UTF-8&oe=UTF-8&btnI=I%27m+Feeling+Lucky&q=");
pref("keyword.enabled", true);
pref("general.useragent.locale", "chrome://navigator/locale/navigator.properties");
pref("general.useragent.contentlocale", "chrome://navigator-region/locale/region.properties");

pref("general.config.obscure_value", 13); // for MCD .cfg files

// maximum number of dated backups to keep at any time
pref("browser.bookmarks.max_backups",       5);

pref("browser.cache.disk.enable",           false);
pref("browser.cache.disk.capacity",         51200);
pref("browser.cache.memory.enable",         true);
//pref("browser.cache.memory.capacity",     -1);
// -1 = determine dynamically, 0 = none, n = memory capacity in kilobytes
pref("browser.cache.disk_cache_ssl",        false);
// 0 = once-per-session, 1 = each-time, 2 = never, 3 = when-appropriate/automatically
pref("browser.cache.check_doc_frequency",   3);
// Fastback caching - if this pref is negative, then we calculate the number
// of content viewers to cache based on the amount of available memory.
pref("browser.sessionhistory.max_total_viewers", 2);

pref("browser.display.use_document_fonts",  1);  // 0 = never, 1 = quick, 2 = always
pref("browser.display.use_document_colors", true);
pref("browser.display.use_system_colors",   false);
pref("browser.display.foreground_color",    "#000000");
pref("browser.display.background_color",    "#FFFFFF");
pref("browser.display.force_inline_alttext", false); // true = force ALT text for missing images to be layed out inline
// 0 = no external leading, 
// 1 = use external leading only when font provides, 
// 2 = add extra leading both internal leading and external leading are zero
pref("browser.display.normal_lineheight_calc_control", 2);
pref("browser.display.show_image_placeholders", false); // true = show image placeholders while image is loaded and when image is broken
pref("browser.anchor_color",                "#0000EE");
pref("browser.active_color",                "#EE0000");
pref("browser.visited_color",               "#551A8B");
pref("browser.underline_anchors",           true);
pref("browser.blink_allowed",               true);
pref("browser.enable_automatic_image_resizing", true);

// See http://whatwg.org/specs/web-apps/current-work/#ping
pref("browser.send_pings", false);
pref("browser.send_pings.max_per_link", 1);           // limit the number of pings that are sent per link click
pref("browser.send_pings.require_same_host", false);  // only send pings to the same host if this is true

pref("browser.display.use_focus_colors",    false);
pref("browser.display.focus_background_color", "#117722");
pref("browser.display.focus_text_color",     "#ffffff");
pref("browser.display.focus_ring_width",     2);
pref("browser.display.focus_ring_on_anything", true);

pref("browser.helperApps.alwaysAsk.force",  false);
pref("browser.helperApps.neverAsk.saveToDisk", "");
pref("browser.helperApps.neverAsk.openFile", "");

// xxxbsmedberg: where should prefs for the toolkit go?
pref("browser.chrome.toolbar_tips",         true);
// 0 = Pictures Only, 1 = Text Only, 2 = Pictures and Text
pref("browser.chrome.toolbar_style",        2);
// max image size for which it is placed in the tab icon for tabbrowser.
// if 0, no images are used for tab icons for image documents.
pref("browser.chrome.image_icons.max_size", 1024);

pref("browser.triple_click_selects_paragraph", true);

pref("accessibility.browsewithcaret", false);
pref("accessibility.warn_on_browsewithcaret", true);

// Tab focus model bit field:
// 1 focuses text controls, 2 focuses other form elements, 4 adds links.
// Most users will want 1, 3, or 7.
// On OS X, we use Full Keyboard Access system preference,
// unless accessibility.tabfocus is set by the user.
pref("accessibility.tabfocus", 7);
pref("accessibility.tabfocus_applies_to_xul", false);

pref("accessibility.usetexttospeech", "");
pref("accessibility.usebrailledisplay", "");
pref("accessibility.accesskeycausesactivation", true);

// Type Ahead Find
pref("accessibility.typeaheadfind", true);
pref("accessibility.typeaheadfind.autostart", true);
// casesensitive: controls the find bar's case-sensitivity
//     0 - "never"  (case-insensitive)
//     1 - "always" (case-sensitive)
// other - "auto"   (case-sensitive for mixed-case input, insensitive otherwise)
pref("accessibility.typeaheadfind.casesensitive", 0);
pref("accessibility.typeaheadfind.linksonly", true);
pref("accessibility.typeaheadfind.startlinksonly", false);
pref("accessibility.typeaheadfind.timeout", 4000);
pref("accessibility.typeaheadfind.enabletimeout", true);
pref("accessibility.typeaheadfind.soundURL", "beep");
pref("accessibility.typeaheadfind.enablesound", true);

pref("browser.history_expire_days", 9);

// loading and rendering of framesets and iframes
pref("browser.frames.enabled", true);

// form submission
pref("browser.forms.submit.backwards_compatible", true);

// xxxbsmedberg more toolkit prefs?
// Tab browser preferences.
pref("browser.tabs.autoHide", true);
pref("browser.tabs.forceHide", false);
pref("browser.tabs.warnOnClose", true);
pref("browser.tabs.warnOnCloseOther", true);
pref("browser.tabs.warnOnOpen", true);
pref("browser.tabs.maxOpenBeforeWarn", 15);
// 0 = append, 1 = replace
pref("browser.tabs.loadGroup", 1);

pref("toolkit.scrollbox.scrollIncrement", 20);
pref("toolkit.scrollbox.clickToScroll.scrollDelay", 150);

// lets new tab/window load something different than first window
// -1 - use navigator startup preference
//  0 - loads blank page
//  1 - loads home page
//  2 - loads last page visited
pref("browser.tabs.loadOnNewTab", 0);
pref("browser.windows.loadOnNewWindow", 1);

// view source
pref("view_source.syntax_highlight", true);
pref("view_source.wrap_long_lines", false);

// dispatch left clicks only to content in browser (still allows clicks to chrome/xul)
pref("nglayout.events.dispatchLeftClickOnly", true);

// whether or not to use xbl form controls
pref("nglayout.debug.enable_xbl_forms", false);

// size of scrollbar snapping region
pref("slider.snapMultiplier", 6);

// option to choose plug-in finder
pref("application.use_ns_plugin_finder", false);

// URI fixup prefs
pref("browser.fixup.alternate.enabled", true);
pref("browser.fixup.alternate.prefix", "www.");
pref("browser.fixup.alternate.suffix", ".com .org .net");
pref("browser.fixup.hide_user_pass", true);

// Print header customization
// Use the following codes:
// &T - Title
// &U - Document URL
// &D - Date/Time
// &P - Page Number
// &PT - Page Number "of" Page total
// Set each header to a string containing zero or one of these codes
// and the code will be replaced in that string by the corresponding data
pref("print.print_headerleft", "&T");
pref("print.print_headercenter", "");
pref("print.print_headerright", "&U");
pref("print.print_footerleft", "&PT");
pref("print.print_footercenter", "");
pref("print.print_footerright", "&D");
pref("print.show_print_progress", true);

// xxxbsmedberg: more toolkit prefs

// When this is set to false each window has its own PrintSettings
// and a change in one window does not affect the others
pref("print.use_global_printsettings", true);

// Use the native dialog or the XP dialog?
pref("print.use_native_print_dialog", false);

// Save the Printings after each print job
pref("print.save_print_settings", true);

pref("print.whileInPrintPreview", true);

// Cache old Presentation when going into Print Preview
pref("print.always_cache_old_pres", false);

// Enables you to specify the gap from the edge of the paper to the margin
// this is used by both Printing and Print Preview
pref("print.print_edge_top", 0); // 1/100 of an inch
pref("print.print_edge_left", 0); // 1/100 of an inch
pref("print.print_edge_right", 0); // 1/100 of an inch
pref("print.print_edge_bottom", 0); // 1/100 of an inch

// Pref used by the spellchecker extension to control the 
// maximum number of misspelled words that will be underlined
// in a document.
pref("extensions.spellcheck.inline.max-misspellings", 500);

// Prefs used by libeditor. Prefs specific to seamonkey composer
// belong in mozilla/editor/ui/composer.js

pref("editor.use_custom_colors", false);
pref("editor.htmlWrapColumn", 72);
pref("editor.singleLine.pasteNewlines",     1);
pref("editor.quotesPreformatted",            false);
pref("editor.use_css",                       true);
pref("editor.css.default_length_unit",       "px");
pref("editor.resizing.preserve_ratio",       true);
pref("editor.positioning.offset",            0);


// Default Capability Preferences: Security-Critical! 
// Editing these may create a security risk - be sure you know what you're doing
//pref("capability.policy.default.barprop.visible.set", "UniversalBrowserWrite");

pref("capability.policy.default_policynames", "mailnews");

pref("capability.policy.default.DOMException.code", "allAccess");
pref("capability.policy.default.DOMException.message", "allAccess");
pref("capability.policy.default.DOMException.name", "allAccess");
pref("capability.policy.default.DOMException.result", "allAccess");
pref("capability.policy.default.DOMException.toString.get", "allAccess");

pref("capability.policy.default.History.back.get", "allAccess");
pref("capability.policy.default.History.current", "UniversalBrowserRead");
pref("capability.policy.default.History.forward.get", "allAccess");
pref("capability.policy.default.History.go.get", "allAccess");
pref("capability.policy.default.History.item", "UniversalBrowserRead");
pref("capability.policy.default.History.next", "UniversalBrowserRead");
pref("capability.policy.default.History.previous", "UniversalBrowserRead");
pref("capability.policy.default.History.toString", "UniversalBrowserRead");

pref("capability.policy.default.HTMLDocument.open.get", "allAccess");

pref("capability.policy.default.Location.hash.set", "allAccess");
pref("capability.policy.default.Location.href.set", "allAccess");
pref("capability.policy.default.Location.replace.get", "allAccess");

pref("capability.policy.default.Navigator.preference", "allAccess");
pref("capability.policy.default.Navigator.preferenceinternal.get", "UniversalPreferencesRead");
pref("capability.policy.default.Navigator.preferenceinternal.set", "UniversalPreferencesWrite");

pref("capability.policy.default.Window.blur.get", "allAccess");
pref("capability.policy.default.Window.close.get", "allAccess");
pref("capability.policy.default.Window.closed.get", "allAccess");
pref("capability.policy.default.Window.document.get", "allAccess");
pref("capability.policy.default.Window.focus.get", "allAccess");
pref("capability.policy.default.Window.frames.get", "allAccess");
pref("capability.policy.default.Window.history.get", "allAccess");
pref("capability.policy.default.Window.length.get", "allAccess");
pref("capability.policy.default.Window.location", "allAccess");
pref("capability.policy.default.Window.opener.get", "allAccess");
pref("capability.policy.default.Window.parent.get", "allAccess");
pref("capability.policy.default.Window.self.get", "allAccess");
pref("capability.policy.default.Window.top.get", "allAccess");
pref("capability.policy.default.Window.window.get", "allAccess");

pref("capability.policy.default.Selection.addSelectionListener", "UniversalXPConnect");
pref("capability.policy.default.Selection.removeSelectionListener", "UniversalXPConnect");

// Restrictions on the DOM for mail/news - see bugs 66938 and 84545
pref("capability.policy.mailnews.sites", "mailbox: imap: news:");

pref("capability.policy.mailnews.*.attributes.get", "noAccess");
pref("capability.policy.mailnews.*.baseURI.get", "noAccess");
pref("capability.policy.mailnews.*.data.get", "noAccess");
pref("capability.policy.mailnews.*.getAttribute", "noAccess");
pref("capability.policy.mailnews.HTMLDivElement.getAttribute", "sameOrigin");
pref("capability.policy.mailnews.*.getAttributeNS", "noAccess");
pref("capability.policy.mailnews.*.getNamedItem", "noAccess");
pref("capability.policy.mailnews.*.getNamedItemNS", "noAccess");
pref("capability.policy.mailnews.*.host.get", "noAccess");
pref("capability.policy.mailnews.*.hostname.get", "noAccess");
pref("capability.policy.mailnews.*.href.get", "noAccess");
pref("capability.policy.mailnews.*.innerHTML.get", "noAccess");
pref("capability.policy.mailnews.*.lowSrc.get", "noAccess");
pref("capability.policy.mailnews.*.nodeValue.get", "noAccess");
pref("capability.policy.mailnews.*.pathname.get", "noAccess");
pref("capability.policy.mailnews.*.protocol.get", "noAccess");
pref("capability.policy.mailnews.*.src.get", "noAccess");
pref("capability.policy.mailnews.*.substringData.get", "noAccess");
pref("capability.policy.mailnews.*.text.get", "noAccess");
pref("capability.policy.mailnews.*.title.get", "noAccess");
pref("capability.policy.mailnews.DOMException.toString", "noAccess");
pref("capability.policy.mailnews.HTMLAnchorElement.toString", "noAccess");
pref("capability.policy.mailnews.HTMLDocument.domain", "noAccess");
pref("capability.policy.mailnews.HTMLDocument.URL", "noAccess");
pref("capability.policy.mailnews.Location.toString", "noAccess");
pref("capability.policy.mailnews.Range.toString", "noAccess");
pref("capability.policy.mailnews.Window.blur", "noAccess");
pref("capability.policy.mailnews.Window.focus", "noAccess");
pref("capability.policy.mailnews.Window.innerWidth.set", "noAccess");
pref("capability.policy.mailnews.Window.innerHeight.set", "noAccess");
pref("capability.policy.mailnews.Window.moveBy", "noAccess");
pref("capability.policy.mailnews.Window.moveTo", "noAccess");
pref("capability.policy.mailnews.Window.name.set", "noAccess");
pref("capability.policy.mailnews.Window.outerHeight.set", "noAccess");
pref("capability.policy.mailnews.Window.outerWidth.set", "noAccess");
pref("capability.policy.mailnews.Window.resizeBy", "noAccess");
pref("capability.policy.mailnews.Window.resizeTo", "noAccess");
pref("capability.policy.mailnews.Window.screenX.set", "noAccess");
pref("capability.policy.mailnews.Window.screenY.set", "noAccess");
pref("capability.policy.mailnews.Window.sizeToContent", "noAccess");
pref("capability.policy.mailnews.document.load", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.channel", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.getInterface", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.responseXML", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.responseText", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.status", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.statusText", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.abort", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.getAllResponseHeaders", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.getResponseHeader", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.open", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.send", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.setRequestHeader", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.readyState", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.overrideMimeType", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.onload", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.onerror", "noAccess");
pref("capability.policy.mailnews.XMLHttpRequest.onreadystatechange", "noAccess");
pref("capability.policy.mailnews.XMLSerializer.serializeToString", "noAccess");
pref("capability.policy.mailnews.XMLSerializer.serializeToStream", "noAccess");
pref("capability.policy.mailnews.DOMParser.parseFromString", "noAccess");
pref("capability.policy.mailnews.DOMParser.parseFromStream", "noAccess");
pref("capability.policy.mailnews.SOAPCall.transportURI", "noAccess");
pref("capability.policy.mailnews.SOAPCall.verifySourceHeader", "noAccess");
pref("capability.policy.mailnews.SOAPCall.invoke", "noAccess");
pref("capability.policy.mailnews.SOAPCall.asyncInvoke", "noAccess");
pref("capability.policy.mailnews.SOAPResponse.fault", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.styleURI", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.getAssociatedEncoding", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.setEncoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.getEncoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.setDecoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.setDecoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.getDecoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.defaultEncoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.defaultDecoder", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.schemaCollection", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.encode", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.decode", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.mapSchemaURI", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.unmapSchemaURI", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.getInternalSchemaURI", "noAccess");
pref("capability.policy.mailnews.SOAPEncoding.getExternalSchemaURI", "noAccess");
pref("capability.policy.mailnews.SOAPFault.element", "noAccess");
pref("capability.policy.mailnews.SOAPFault.faultNamespaceURI", "noAccess");
pref("capability.policy.mailnews.SOAPFault.faultCode", "noAccess");
pref("capability.policy.mailnews.SOAPFault.faultString", "noAccess");
pref("capability.policy.mailnews.SOAPFault.faultActor", "noAccess");
pref("capability.policy.mailnews.SOAPFault.detail", "noAccess");
pref("capability.policy.mailnews.SOAPHeaderBlock.actorURI", "noAccess");
pref("capability.policy.mailnews.SOAPHeaderBlock.mustUnderstand", "noAccess");
pref("capability.policy.mailnews.SOAPParameter", "noAccess");
pref("capability.policy.mailnews.SOAPPropertyBagMutator.propertyBag", "noAccess");
pref("capability.policy.mailnews.SOAPPropertyBagMutator.addProperty", "noAccess");
pref("capability.policy.mailnews.SchemaLoader.load", "noAccess");
pref("capability.policy.mailnews.SchemaLoader.loadAsync", "noAccess");
pref("capability.policy.mailnews.SchemaLoader.processSchemaElement", "noAccess");
pref("capability.policy.mailnews.SchemaLoader.onLoad", "noAccess");
pref("capability.policy.mailnews.SchemaLoader.onError", "noAccess");
pref("capability.policy.mailnews.WSDLLoader.load", "noAccess");
pref("capability.policy.mailnews.WSDLLoader.loadAsync", "noAccess");
pref("capability.policy.mailnews.WSDLLoader.onLoad", "noAccess");
pref("capability.policy.mailnews.WSDLLoader.onError", "noAccess");
pref("capability.policy.mailnews.WebServiceProxyFactory.createProxy", "noAccess");
pref("capability.policy.mailnews.WebServiceProxyFactory.createProxyAsync", "noAccess");
pref("capability.policy.mailnews.WebServiceProxyFactory.onLoad", "noAccess");
pref("capability.policy.mailnews.WebServiceProxyFactory.onError", "noAccess");

// XMLExtras
pref("capability.policy.default.XMLHttpRequest.channel", "noAccess");
pref("capability.policy.default.XMLHttpRequest.getInterface", "noAccess");
pref("capability.policy.default.DOMParser.parseFromStream", "noAccess");

// Clipboard
pref("capability.policy.default.Clipboard.cutcopy", "noAccess");
pref("capability.policy.default.Clipboard.paste", "noAccess");

// Scripts & Windows prefs
pref("dom.disable_image_src_set",           false);
pref("dom.disable_window_flip",             false);
pref("dom.disable_window_move_resize",      true);
pref("dom.disable_window_status_change",    false);

pref("dom.disable_window_open_feature.titlebar",    false);
pref("dom.disable_window_open_feature.close",       false);
pref("dom.disable_window_open_feature.toolbar",     false);
pref("dom.disable_window_open_feature.location",    false);
pref("dom.disable_window_open_feature.directories", false);
pref("dom.disable_window_open_feature.personalbar", false);
pref("dom.disable_window_open_feature.menubar",     false);
pref("dom.disable_window_open_feature.scrollbars",  false);
pref("dom.disable_window_open_feature.resizable",   false);
pref("dom.disable_window_open_feature.minimizable", false);
pref("dom.disable_window_open_feature.status",      true);

pref("dom.allow_scripts_to_close_windows",          false);

pref("dom.disable_open_during_load",                false);
pref("dom.popup_maximum",                           20);
pref("dom.popup_allowed_events", "change click dblclick mouseup reset submit");
pref("dom.disable_open_click_delay", 1000);

pref("dom.storage.enabled", true);

// Disable popups from plugins by default
//   0 = openAllowed
//   1 = openControlled
//   2 = openAbused
pref("privacy.popups.disable_from_plugins", 2);

pref("dom.event.contextmenu.enabled",       true);

pref("javascript.enabled",                  true);
pref("javascript.allow.mailnews",           false);
pref("javascript.options.strict",           false);

// advanced prefs
pref("security.enable_java",                true);
pref("advanced.mailftp",                    false);
pref("image.animation_mode",                "normal");

// If there is ever a security firedrill that requires
// us to block certian ports global, this is the pref 
// to use.  Is is a comma delimited list of port numbers
// for example:
//   pref("network.security.ports.banned", "1,2,3,4,5");
// prevents necko connecting to ports 1-5 unless the protocol
// overrides.

// Default action for unlisted external protocol handlers
pref("network.protocol-handler.external-default", true);      // OK to load
pref("network.protocol-handler.warn-external-default", true); // warn before load

// Prevent using external protocol handlers for these schemes
pref("network.protocol-handler.external.hcp", false);
pref("network.protocol-handler.external.vbscript", false);
pref("network.protocol-handler.external.javascript", false);
pref("network.protocol-handler.external.data", false);
pref("network.protocol-handler.external.ms-help", false);
pref("network.protocol-handler.external.shell", false);
pref("network.protocol-handler.external.vnd.ms.radio", false);
pref("network.protocol-handler.external.disk", false);
pref("network.protocol-handler.external.disks", false);
pref("network.protocol-handler.external.afp", false);

// An exposed protocol handler is one that can be used in all contexts.  A
// non-exposed protocol handler is one that can only be used internally by the
// application.  For example, a non-exposed protocol would not be loaded by the
// application in response to a link click or a X-remote openURL command.
// Instead, it would be deferred to the system's external protocol handler.
// Only internal/built-in protocol handlers can be marked as exposed.

// This pref controls the default settings.  Per protocol settings can be used
// to override this value.
pref("network.protocol-handler.expose-all", true);

// Example: make IMAP an exposed protocol
// pref("network.protocol-handler.expose.imap", true);

pref("network.hosts.smtp_server",           "mail");
pref("network.hosts.pop_server",            "mail");

// <http>
pref("network.http.version", "1.1");	  // default
// pref("network.http.version", "1.0");   // uncomment this out in case of problems
// pref("network.http.version", "0.9");   // it'll work too if you're crazy
// keep-alive option is effectively obsolete. Nevertheless it'll work with
// some older 1.0 servers:

pref("network.http.proxy.version", "1.1");    // default
// pref("network.http.proxy.version", "1.0"); // uncomment this out in case of problems
                                              // (required if using junkbuster proxy)

// enable caching of http documents
pref("network.http.use-cache", true);

// this preference can be set to override the socket type used for normal
// HTTP traffic.  an empty value indicates the normal TCP/IP socket type.
pref("network.http.default-socket-type", "");

pref("network.http.keep-alive", true); // set it to false in case of problems
pref("network.http.proxy.keep-alive", true);
pref("network.http.keep-alive.timeout", 300);

// limit the absolute number of http connections.
pref("network.http.max-connections", 24);

// limit the absolute number of http connections that can be established per
// host.  if a http proxy server is enabled, then the "server" is the proxy
// server.  Otherwise, "server" is the http origin server.
pref("network.http.max-connections-per-server", 8);

// if network.http.keep-alive is true, and if NOT connecting via a proxy, then
// a new connection will only be attempted if the number of active persistent
// connections to the server is less then max-persistent-connections-per-server.
pref("network.http.max-persistent-connections-per-server", 4);

// if network.http.keep-alive is true, and if connecting via a proxy, then a
// new connection will only be attempted if the number of active persistent
// connections to the proxy is less then max-persistent-connections-per-proxy.
pref("network.http.max-persistent-connections-per-proxy", 2);

// amount of time (in seconds) to suspend pending requests, before spawning a
// new connection, once the limit on the number of persistent connections per
// host has been reached.  however, a new connection will not be created if
// max-connections or max-connections-per-server has also been reached.
pref("network.http.request.max-start-delay", 3);

// Headers
pref("network.http.accept.default", "text/xml,application/xml,application/atom+xml,application/rss+xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5");
pref("network.http.sendRefererHeader",      2); // 0=don't send any, 1=send only on clicks, 2=send on image requests as well

// Controls whether we send HTTPS referres to other HTTPS sites.
// By default this is enabled for compatibility (see bug 141641)
pref("network.http.sendSecureXSiteReferrer", true);

// Maximum number of consecutive redirects before aborting.
pref("network.http.redirection-limit", 20);

// Enable http compression: comment this out in case of problems with 1.1
// NOTE: support for "compress" has been disabled per bug 196406.
pref("network.http.accept-encoding" ,"gzip,deflate");

pref("network.http.pipelining"      , true);
pref("network.http.proxy.pipelining", true);
pref("network.http.pipelining.firstrequest", true);

// Max number of requests in the pipeline
pref("network.http.pipelining.maxrequests" , 8);

// </http>

// This preference controls whether or not internationalized domain names (IDN)
// are handled.  IDN requires a nsIIDNService implementation.
pref("network.enableIDN", true);

// This preference, if true, causes all UTF-8 domain names to be normalized to
// punycode.  The intention is to allow UTF-8 domain names as input, but never
// generate them from punycode.
pref("network.IDN_show_punycode", false);

// TLDs with "network.IDN.whitelist.tld" explicitly set to true are treated as 
// IDN-safe. Otherwise, they're treated as unsafe and punycode will be used
// for displaying them in the UI (e.g. URL bar). Note that these preferences
// are referred to ONLY when "network.IDN_show_punycode" is false. In other
// words, all IDNs will be shown in punycode if "network.IDN_show_punycode"
// is true.

// ccTLDs
pref("network.IDN.whitelist.ac", true);
pref("network.IDN.whitelist.at", true);
pref("network.IDN.whitelist.br", true);
pref("network.IDN.whitelist.ch", true);
pref("network.IDN.whitelist.cl", true);
pref("network.IDN.whitelist.cn", true);
pref("network.IDN.whitelist.de", true);
pref("network.IDN.whitelist.dk", true);
pref("network.IDN.whitelist.fi", true);
pref("network.IDN.whitelist.gr", true);
pref("network.IDN.whitelist.hu", true);
pref("network.IDN.whitelist.io", true);
pref("network.IDN.whitelist.is", true);
pref("network.IDN.whitelist.jp", true);
pref("network.IDN.whitelist.kr", true);
pref("network.IDN.whitelist.li", true);
pref("network.IDN.whitelist.lt", true);
pref("network.IDN.whitelist.no", true);
pref("network.IDN.whitelist.se", true);
pref("network.IDN.whitelist.sh", true);
pref("network.IDN.whitelist.th", true);
pref("network.IDN.whitelist.tm", true);
pref("network.IDN.whitelist.tw", true);
pref("network.IDN.whitelist.vn", true);

// non-ccTLDs
pref("network.IDN.whitelist.biz", true);
pref("network.IDN.whitelist.cat", true);
pref("network.IDN.whitelist.info", true);
pref("network.IDN.whitelist.museum", true);
pref("network.IDN.whitelist.org", true);

// If a domain includes any of the following characters, it may be a spoof 
// attempt and so we always display the domain name as punycode. This would 
// override the settings "network.IDN_show_punycode" and 
// "network.IDN.whitelist.*".
pref("network.IDN.blacklist_chars", "\u0020\u00A0\u00BC\u00BD\u01C3\u0337\u0338\u05C3\u05F4\u06D4\u0702\u115F\u1160\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u2024\u2027\u2028\u2029\u202F\u2039\u203A\u2044\u205F\u2154\u2155\u2156\u2159\u215A\u215B\u215F\u2215\u23AE\u29F6\u29F8\u2AFB\u2AFD\u2FF0\u2FF1\u2FF2\u2FF3\u2FF4\u2FF5\u2FF6\u2FF7\u2FF8\u2FF9\u2FFA\u2FFB\u3000\u3002\u3014\u3015\u3033\u3164\u321D\u321E\u33AE\u33AF\u33C6\u33DF\uFE14\uFE15\uFE3F\uFE5D\uFE5E\uFEFF\uFF0E\uFF0F\uFF61\uFFA0\uFFF9\uFFFA\uFFFB\uFFFC\uFFFD");

// This preference specifies a list of domains for which DNS lookups will be
// IPv4 only. Works around broken DNS servers which can't handle IPv6 lookups
// and/or allows the user to disable IPv6 on a per-domain basis. See bug 68796.
pref("network.dns.ipv4OnlyDomains", ".doubleclick.net");

// This preference can be used to turn off IPv6 name lookups. See bug 68796.
pref("network.dns.disableIPv6", true);

// This preference controls whether or not URLs with UTF-8 characters are
// escaped.  Set this preference to TRUE for strict RFC2396 conformance.
pref("network.standard-url.escape-utf8", true);

// This preference controls whether or not URLs are always encoded and sent as
// UTF-8.
pref("network.standard-url.encode-utf8", true);

// This preference controls whether or not queries are encoded and sent as
// UTF-8.
pref("network.standard-url.encode-query-utf8", false);

// Idle timeout for ftp control connections - 5 minute default
pref("network.ftp.idleConnectionTimeout", 300);

// directory listing format
// 2: HTML
// 3: XUL directory viewer
// all other values are treated like 2
pref("network.dir.format", 2);

// enables the prefetch service (i.e., prefetching of <link rel="next"> URLs).
pref("network.prefetch-next", true);


// The following prefs pertain to the negotiate-auth extension (see bug 17578),
// which provides transparent Kerberos or NTLM authentication using the SPNEGO
// protocol.  Each pref is a comma-separated list of keys, where each key has
// the format:
//   [scheme "://"] [host [":" port]]
// For example, "foo.com" would match "http://www.foo.com/bar", etc.

// This list controls which URIs can use the negotiate-auth protocol.  This
// list should be limited to the servers you know you'll need to login to.
pref("network.negotiate-auth.trusted-uris", "");
// This list controls which URIs can support delegation.
pref("network.negotiate-auth.delegation-uris", "");

// Allow SPNEGO by default when challenged by a proxy server.
pref("network.negotiate-auth.allow-proxies", true);

// Path to a specific gssapi library
pref("network.negotiate-auth.gsslib", "");

// Specify if the gss lib comes standard with the OS
pref("network.negotiate-auth.using-native-gsslib", true);


// The following prefs are used to enable automatic use of the operating
// system's NTLM implementation to silently authenticate the user with their
// Window's domain logon.  The trusted-uris pref follows the format of the
// trusted-uris pref for negotiate authentication.
pref("network.automatic-ntlm-auth.allow-proxies", true);
pref("network.automatic-ntlm-auth.trusted-uris", "");

// This preference controls whether or not the LM hash will be included in
// response to a NTLM challenge.  By default, this is disabled since servers
// should almost never need the LM hash, and the LM hash is what makes NTLM
// authentication less secure.  See bug 250691 for further details.
// NOTE: automatic-ntlm-auth which leverages the OS-provided NTLM
//       implementation will not be affected by this preference.
pref("network.ntlm.send-lm-response", false);

// sspitzer:  change this back to "news" when we get to beta.
// for now, set this to news.mozilla.org because you can only
// post to the server specified by this pref.
pref("network.hosts.nntp_server",           "news.mozilla.org");

pref("permissions.default.image",           1); // 1-Accept, 2-Deny, 3-dontAcceptForeign
pref("network.proxy.type",                  0);
pref("network.proxy.ftp",                   "");
pref("network.proxy.ftp_port",              0);
pref("network.proxy.gopher",                "");
pref("network.proxy.gopher_port",           0);
pref("network.proxy.http",                  "");
pref("network.proxy.http_port",             0);
pref("network.proxy.ssl",                   "");
pref("network.proxy.ssl_port",              0);
pref("network.proxy.socks",                 "");
pref("network.proxy.socks_port",            0);
pref("network.proxy.socks_version",         5);
pref("network.proxy.socks_remote_dns",      false);
pref("network.proxy.no_proxies_on",         "localhost, 127.0.0.1");
pref("network.proxy.failover_timeout",      1800); // 30 minutes
pref("network.online",                      true); //online/offline
pref("network.cookie.cookieBehavior",       0); // 0-Accept, 1-dontAcceptForeign, 2-dontUse, 3-p3p
pref("network.cookie.disableCookieForMailNews", true); // disable all cookies for mail
pref("network.cookie.lifetimePolicy",       0); // accept normally, 1-askBeforeAccepting, 2-acceptForSession,3-acceptForNDays
pref("network.cookie.alwaysAcceptSessionCookies", false);
pref("network.cookie.prefsMigrated",        false);
pref("network.cookie.lifetime.days",        90);

// The PAC file to load.  Ignored unless network.proxy.type is 2.
pref("network.proxy.autoconfig_url", "");

// If we cannot load the PAC file, then try again (doubling from interval_min
// until we reach interval_max or the PAC file is successfully loaded).
pref("network.proxy.autoconfig_retry_interval_min", 5);    // 5 seconds
pref("network.proxy.autoconfig_retry_interval_max", 300);  // 5 minutes

pref("converter.html2txt.structs",          true); // Output structured phrases (strong, em, code, sub, sup, b, i, u)
pref("converter.html2txt.header_strategy",  1); // 0 = no indention; 1 = indention, increased with header level; 2 = numbering and slight indention

pref("intl.accept_languages",               "chrome://navigator/locale/navigator.properties");
pref("intl.accept_charsets",                "iso-8859-1,*,utf-8");
pref("intl.collationOption",                "chrome://navigator-platform/locale/navigator.properties");
pref("intl.menuitems.alwaysappendaccesskeys","chrome://navigator/locale/navigator.properties");
pref("intl.menuitems.insertseparatorbeforeaccesskeys","chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.static",     "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.more1",      "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.more2",      "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.more3",      "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.more4",      "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.more5",      "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.unicode",    "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.mailedit",           "chrome://navigator/locale/navigator.properties");
pref("intl.charsetmenu.browser.cache",      "");
pref("intl.charsetmenu.mailview.cache",     "");
pref("intl.charsetmenu.composer.cache",     "");
pref("intl.charsetmenu.browser.cache.size", 5);
pref("intl.charset.detector",               "chrome://navigator/locale/navigator.properties");
pref("intl.charset.default",                "chrome://navigator-platform/locale/navigator.properties");
pref("intl.content.langcode",               "chrome://communicator-region/locale/region.properties");
pref("intl.locale.matchOS",                 true);
// fallback charset list for Unicode conversion (converting from Unicode)
// currently used for mail send only to handle symbol characters (e.g Euro, trademark, smartquotes)
// for ISO-8859-1
pref("intl.fallbackCharsetList.ISO-8859-1", "windows-1252");
pref("font.language.group",                 "chrome://navigator/locale/navigator.properties");

pref("images.dither", "auto");
pref("security.directory",              "");

pref("signed.applets.codebase_principal_support", false);
pref("security.checkloaduri", true);
pref("security.xpconnect.plugin.unrestricted", true);
// security-sensitive dialogs should delay button enabling. In milliseconds.
pref("security.dialog_enable_delay", 2000);

// Modifier key prefs: default to Windows settings,
// menu access key = alt, accelerator key = control.
// Use 17 for Ctrl, 18 for Alt, 224 for Meta, 0 for none. Mac settings in macprefs.js
pref("ui.key.accelKey", 17);
pref("ui.key.menuAccessKey", 18);
pref("ui.key.generalAccessKey", -1);

// If generalAccessKey is -1, use the following two prefs instead.
// Use 0 for disabled, 1 for Shift, 2 for Ctrl, 4 for Alt, 8 for Meta
// (values can be combined, e.g. 5 for Alt+Shift)
pref("ui.key.chromeAccess", 4);
pref("ui.key.contentAccess", 5);

pref("ui.key.menuAccessKeyFocuses", false); // overridden below
pref("ui.key.saveLink.shift", true); // true = shift, false = meta

// Middle-mouse handling
pref("middlemouse.paste", false);
pref("middlemouse.openNewWindow", true);
pref("middlemouse.contentLoadURL", false);
pref("middlemouse.scrollbarPosition", false);

// Clipboard behavior
pref("clipboard.autocopy", false);

// mouse wheel scroll transaction period of time (in milliseconds)
pref("mousewheel.transaction.timeout", 1500);
// mouse wheel scroll transaction is held even if the mouse cursor is moved.
pref("mousewheel.transaction.ignoremovedelay", 100);

// 0=lines, 1=pages, 2=history , 3=text size
pref("mousewheel.withnokey.action",0);
pref("mousewheel.withnokey.numlines",1);	
pref("mousewheel.withnokey.sysnumlines",true);
pref("mousewheel.withcontrolkey.action",0);
pref("mousewheel.withcontrolkey.numlines",1);
pref("mousewheel.withcontrolkey.sysnumlines",true);
// mousewheel.withshiftkey, see the Mac note below.
pref("mousewheel.withshiftkey.action",0);
pref("mousewheel.withshiftkey.numlines",1);
pref("mousewheel.withshiftkey.sysnumlines",true);
pref("mousewheel.withaltkey.action",2);
pref("mousewheel.withaltkey.numlines",1);
pref("mousewheel.withaltkey.sysnumlines",false);
pref("mousewheel.withmetakey.action",0);
pref("mousewheel.withmetakey.numlines",1);
pref("mousewheel.withmetakey.sysnumlines",true);

// on platforms where scroll messages differ between horizontal scroll
// and back/forward button events we can activate them by default
// disable horizontal scrolling to be able to use back/forward buttons
pref("mousewheel.horizscroll.withnokey.action",2);
pref("mousewheel.horizscroll.withnokey.numlines",-1);
pref("mousewheel.horizscroll.withnokey.sysnumlines",false);
pref("mousewheel.horizscroll.withcontrolkey.action",2);
pref("mousewheel.horizscroll.withcontrolkey.numlines",-1);
pref("mousewheel.horizscroll.withcontrolkey.sysnumlines",false);
pref("mousewheel.horizscroll.withshiftkey.action",2);
pref("mousewheel.horizscroll.withshiftkey.numlines",-1);
pref("mousewheel.horizscroll.withshiftkey.sysnumlines",false);
pref("mousewheel.horizscroll.withaltkey.action",2);
pref("mousewheel.horizscroll.withaltkey.numlines",-1);
pref("mousewheel.horizscroll.withaltkey.sysnumlines",false);
pref("mousewheel.horizscroll.withmetakey.action",2);
pref("mousewheel.horizscroll.withmetakey.numlines",-1);
pref("mousewheel.horizscroll.withmetakey.sysnumlines",false);

pref("profile.confirm_automigration",true);
// profile.migration_behavior determines how the profiles root is set
// 0 - use NS_APP_USER_PROFILES_ROOT_DIR
// 1 - create one based on the NS4.x profile root
// 2 - use, if not empty, profile.migration_directory otherwise same as 0
pref("profile.migration_behavior",0);
pref("profile.migration_directory", "");

// the amount of time (in seconds) that must elapse
// before we think your mozilla profile is defunct
// and you'd benefit from re-migrating from 4.x
// see bug #137886 for more details
//
// if -1, we never think your profile is defunct
// and users will never see the remigrate UI.
pref("profile.seconds_until_defunct", -1);
// We can show it anytime from menus
pref("profile.manage_only_at_launch", false);

pref("prefs.converted-to-utf8",false);

// --------------------------------------------------
// IBMBIDI 
// --------------------------------------------------
//
// ------------------
//  Text Direction
// ------------------
// 1 = directionLTRBidi *
// 2 = directionRTLBidi
pref("bidi.direction", 1);
// ------------------
//  Text Type
// ------------------
// 1 = charsettexttypeBidi *
// 2 = logicaltexttypeBidi
// 3 = visualtexttypeBidi
pref("bidi.texttype", 1);
// ------------------
//  Controls Text Mode
// ------------------
// 1 = logicalcontrolstextmodeBidiCmd
// 2 = visualcontrolstextmodeBidi <-- NO LONGER SUPPORTED
// 3 = containercontrolstextmodeBidi *
pref("bidi.controlstextmode", 1);
// ------------------
//  Numeral Style
// ------------------
// 0 = nominalnumeralBidi *
// 1 = regularcontextnumeralBidi
// 2 = hindicontextnumeralBidi
// 3 = arabicnumeralBidi
// 4 = hindinumeralBidi
pref("bidi.numeral", 0);
// ------------------
//  Support Mode
// ------------------
// 1 = mozillaBidisupport *
// 2 = OsBidisupport
// 3 = disableBidisupport
pref("bidi.support", 1);
// ------------------
//  Charset Mode
// ------------------
// 1 = doccharactersetBidi *
// 2 = defaultcharactersetBidi
pref("bidi.characterset", 1);
// Whether delete and backspace should immediately delete characters not
// visually adjacent to the caret, or adjust the visual position of the caret
// on the first keypress and delete the character on a second keypress
pref("bidi.edit.delete_immediately", false);

// Bidi caret movement style:
// 0 = logical
// 1 = visual
// 2 = visual, but logical during selection
pref("bidi.edit.caret_movement_style", 2);

// used for double-click word selection behavior. Win will override.
pref("layout.word_select.eat_space_to_next_word", false);
pref("layout.word_select.stop_at_punctuation", true);

// controls caret style during text selection
// 0 = use platform default
// 1 = caret moves and blinks as when there is no selection
// 2 = caret moves to selection edge and is not visible during selection
pref("layout.selection.caret_style", 0);

// pref to control whether or not to replace backslashes with Yen signs
// in documents encoded in one of Japanese legacy encodings (EUC-JP, 
// Shift_JIS, ISO-2022-JP)
pref("layout.enable_japanese_specific_transform", false);

// pref to force frames to be resizable
pref("layout.frames.force_resizability", false);

// pref to report CSS errors to the error console
pref("layout.css.report_errors", true);

// pref for which side vertical scrollbars should be on
// 0 = end-side in UI direction
// 1 = end-side in document/content direction
// 2 = right
// 3 = left
pref("layout.scrollbar.side", 0);

// pref to permit users to make verified SOAP calls by default
pref("capability.policy.default.SOAPCall.invokeVerifySourceHeader", "allAccess");

// if true, allow plug-ins to override internal imglib decoder mime types in full-page mode
pref("plugin.override_internal_types", false);
pref("plugin.expose_full_path", false); // if true navigator.plugins reveals full path

// See bug 136985.  Gives embedders a pref to hook into to show
// a popup blocker if they choose.
pref("browser.popups.showPopupBlocker", true);

// Pref to control whether the viewmanager code does double-buffering or not
// See http://bugzilla.mozilla.org/show_bug.cgi?id=169483 for further details...
pref("viewmanager.do_doublebuffering", true);

// which files will be selected for roaming by default.
// See sroaming/content/prefs/all.js
pref("roaming.default.files", "bookmarks.html,abook.mab,cookies.txt");
// display some general warning to the user about making backups, security etc.
pref("roaming.showInitialWarning", true);

// whether use prefs from system
pref("config.use_system_prefs", false);

// if the system has enabled accessibility
pref("config.use_system_prefs.accessibility", false);

/*
 * What are the entities that you want Mozilla to save using mnemonic
 * names rather than numeric codes? E.g. If set, we'll output &nbsp;
 * otherwise, we may output 0xa0 depending on the charset.
 *
 * "none"   : don't use any entity names; only use numeric codes.
 * "basic"  : use entity names just for &nbsp; &amp; &lt; &gt; &quot; for 
 *            interoperability/exchange with products that don't support more
 *            than that.
 * "latin1" : use entity names for 8bit accented letters and other special
 *            symbols between 128 and 255.
 * "html"   : use entity names for 8bit accented letters, greek letters, and
 *            other special markup symbols as defined in HTML4.
 */
//pref("editor.encode_entity",                 "html");

pref("editor.resizing.preserve_ratio",       true);
pref("editor.positioning.offset",            0);

pref("dom.max_chrome_script_run_time", 20);
pref("dom.max_script_run_time", 50);

pref("svg.enabled", true);

// Handled differently under Mac/Windows
pref("network.hosts.smtp_server", "localhost");
pref("network.hosts.pop_server", "pop");
pref("network.protocol-handler.warn-external.file", false);
pref("layout.css.dpi", -1); // max(96dpi, System setting)
pref("browser.drag_out_of_frame_style", 1);
pref("editor.singleLine.pasteNewlines", 0);

// Middle-mouse handling
pref("middlemouse.paste", true);
pref("middlemouse.contentLoadURL", true);
pref("middlemouse.openNewWindow", true);
pref("middlemouse.scrollbarPosition", true);

// Clipboard behavior
pref("clipboard.autocopy", true);

pref("browser.urlbar.clickSelectsAll", false);

// Tab focus model bit field:
// 1 focuses text controls, 2 focuses other form elements, 4 adds links.
// Leave this at the default, 7, to match mozilla1.0-era user expectations.
// pref("accessibility.tabfocus", 1);

// override double-click word selection behavior.
pref("layout.word_select.stop_at_punctuation", false);


// autocomplete keyboard grab workaround
pref("autocomplete.grab_during_popup", true);
pref("autocomplete.ungrab_during_mode_switch", true);

// turn off scrollbar snapping
pref("slider.snapMultiplier", 0);

// Default to using the system filepicker if possible, but allow
// toggling to use the XUL filepicker
pref("ui.allow_platform_file_picker", true);

pref("helpers.global_mime_types_file", "/etc/mime.types");
pref("helpers.global_mailcap_file", "/etc/mailcap");
pref("helpers.private_mime_types_file", "~/.mime.types");
pref("helpers.private_mailcap_file", "~/.mailcap");
pref("java.global_java_version_file", "/etc/.java/versions");
pref("java.private_java_version_file", "~/.java/versions");
pref("java.default_java_location_solaris", "/usr/j2se");
pref("java.default_java_location_others", "/usr/java");
pref("java.java_plugin_library_name", "javaplugin_oji");
pref("applications.telnet", "xterm -e telnet %h %p");
pref("applications.tn3270", "xterm -e tn3270 %h");
pref("applications.rlogin", "xterm -e rlogin %h");
pref("applications.rlogin_with_user", "xterm -e rlogin %h -l %u");
pref("print.print_command", "lpr ${MOZ_PRINTER_NAME:+'-P'}${MOZ_PRINTER_NAME}");
pref("print.printer_list", ""); // list of printers, separated by spaces
pref("print.print_reversed", false);
pref("print.print_color", true);
pref("print.print_landscape", false);
pref("print.print_paper_size", 0);

// Enables you to specify the gap from the edge of the paper to the margin
// this is used by both Printing and Print Preview
pref("print.print_edge_top", 4); // 1/100 of an inch
pref("print.print_edge_left", 4); // 1/100 of an inch
pref("print.print_edge_right", 4); // 1/100 of an inch
pref("print.print_edge_bottom", 4); // 1/100 of an inch

// print_extra_margin enables platforms to specify an extra gap or margin
// around the content of the page for Print Preview only
pref("print.print_extra_margin", 0); // twips

pref("print.whileInPrintPreview", false);

pref("font.allow_double_byte_special_chars", true);
// font names

// ar


pref("font.name.serif.el", "serif");
pref("font.name.sans-serif.el", "sans-serif");
pref("font.name.monospace.el", "monospace");

pref("font.name.serif.he", "serif");
pref("font.name.sans-serif.he", "sans-serif");
pref("font.name.monospace.he", "monospace");

pref("font.name.serif.ja", "serif");
pref("font.name.sans-serif.ja", "sans-serif");
pref("font.name.monospace.ja", "monospace");

pref("font.name.serif.ko", "serif");
pref("font.name.sans-serif.ko", "sans-serif");
pref("font.name.monospace.ko", "monospace");

// th

pref("font.name.serif.tr", "serif");
pref("font.name.sans-serif.tr", "sans-serif");
pref("font.name.monospace.tr", "monospace");

pref("font.name.serif.x-baltic", "serif");
pref("font.name.sans-serif.x-baltic", "sans-serif");
pref("font.name.monospace.x-baltic", "monospace");

pref("font.name.serif.x-central-euro", "serif");
pref("font.name.sans-serif.x-central-euro", "sans-serif");
pref("font.name.monospace.x-central-euro", "monospace");

pref("font.name.serif.x-cyrillic", "serif");
pref("font.name.sans-serif.x-cyrillic", "sans-serif");
pref("font.name.monospace.x-cyrillic", "monospace");

pref("font.name.serif.x-unicode", "serif");
pref("font.name.sans-serif.x-unicode", "sans-serif");
pref("font.name.monospace.x-unicode", "monospace");

pref("font.name.serif.x-western", "serif");
pref("font.name.sans-serif.x-western", "sans-serif");
pref("font.name.monospace.x-western", "monospace");

pref("font.name.serif.x-user-def", "serif");
pref("font.name.sans-serif.x-user-def", "sans-serif");
pref("font.name.monospace.x-user-def", "monospace");

pref("font.name.serif.zh-CN", "serif");
pref("font.name.sans-serif.zh-CN", "sans-serif");
pref("font.name.monospace.zh-CN", "monospace");

// ming_uni.ttf (HKSCS-2001) 
// http://www.info.gov.hk/digital21/eng/hkscs/download/uime.exe
pref("font.name.serif.zh-HK", "serif");
pref("font.name.sans-serif.zh-HK", "sans-serif");
pref("font.name.monospace.zh-HK", "monospace");

// zh-TW

pref("font.default.ar", "sans-serif");
pref("font.size.variable.ar", 16);
pref("font.size.fixed.ar", 12);

pref("font.default.el", "serif");
pref("font.size.variable.el", 16);
pref("font.size.fixed.el", 12);

pref("font.default.he", "sans-serif");
pref("font.size.variable.he", 16);
pref("font.size.fixed.he", 12);

pref("font.default.ja", "sans-serif");
pref("font.size.variable.ja", 16);
pref("font.size.fixed.ja", 16);

pref("font.default.ko", "sans-serif");
pref("font.size.variable.ko", 16);
pref("font.size.fixed.ko", 16);

pref("font.default.th", "serif");
pref("font.size.variable.th", 16);
pref("font.size.fixed.th", 12);

pref("font.default.tr", "serif");
pref("font.size.variable.tr", 16);
pref("font.size.fixed.tr", 12);

pref("font.default.x-baltic", "SwissA");
pref("font.size.variable.x-baltic", 16);
pref("font.size.fixed.x-baltic", 12);

pref("font.default.x-central-euro", "SwissA");
pref("font.size.variable.x-central-euro", 16);
pref("font.size.fixed.x-central-euro", 12);

pref("font.default.x-cyrillic", "SwissA");
pref("font.size.variable.x-cyrillic", 16);
pref("font.size.fixed.x-cyrillic", 12);

pref("font.default.x-unicode", "SwissA");
pref("font.size.variable.x-unicode", 16);
pref("font.size.fixed.x-unicode", 12);

pref("font.default.x-western", "SwissA");
pref("font.size.variable.x-western", 16);
pref("font.size.fixed.x-western", 12);

pref("font.default.zh-CN", "sans-serif");
pref("font.size.variable.zh-CN", 16);
pref("font.size.fixed.zh-CN", 16);

pref("font.default.zh-TW", "sans-serif");
pref("font.size.variable.zh-TW", 16);
pref("font.size.fixed.zh-TW", 16);

pref("font.default.zh-HK", "sans-serif");
pref("font.size.variable.zh-HK", 16);
pref("font.size.fixed.zh-HK", 16);

// below a certian pixel size outline scaled fonts produce poor results
pref("font.scale.outline.min",      6);

// TrueType
pref("font.FreeType2.enable", false);
pref("font.freetype2.shared-library", "libfreetype.so.6");
// if libfreetype was built without hinting compiled in
// it is best to leave hinting off
pref("font.FreeType2.autohinted", false);
pref("font.FreeType2.unhinted", true);
// below a certian pixel size anti-aliased fonts produce poor results
pref("font.antialias.min",        10);
pref("font.embedded_bitmaps.max", 1000000);
pref("font.scale.tt_bitmap.dark_text.min", 64);
pref("font.scale.tt_bitmap.dark_text.gain", "0.8");
// sample prefs for TrueType font dirs
//pref("font.directory.truetype.1", "/u/sam/tt_font1");
//pref("font.directory.truetype.2", "/u/sam/tt_font2");
//pref("font.directory.truetype.3", "/u/sam/tt_font3");
pref("font.FreeType2.printing", true);

// below a certian pixel size anti-aliased bitmat scaled fonts 
// produce poor results
pref("font.scale.aa_bitmap.enable", true);
pref("font.scale.aa_bitmap.always", false);
pref("font.scale.aa_bitmap.min", 6);
pref("font.scale.aa_bitmap.undersize", 80);
pref("font.scale.aa_bitmap.oversize", 120);
pref("font.scale.aa_bitmap.dark_text.min", 64);
pref("font.scale.aa_bitmap.dark_text.gain", "0.5");
pref("font.scale.aa_bitmap.light_text.min", 64);
pref("font.scale.aa_bitmap.light_text.gain", "1.3");

pref("font.scale.bitmap.min",       12);
pref("font.scale.bitmap.undersize", 80);
pref("font.scale.bitmap.oversize",  120);

pref("font.scale.outline.min.ja",      10);
pref("font.scale.aa_bitmap.min.ja",    12);
pref("font.scale.aa_bitmap.always.ja", false);
pref("font.scale.bitmap.min.ja",       16);
pref("font.scale.bitmap.undersize.ja", 80);
pref("font.scale.bitmap.oversize.ja",  120);

pref("font.scale.outline.min.ko",      10);
pref("font.scale.aa_bitmap.min.ko",    12);
pref("font.scale.aa_bitmap.always.ko", false);
pref("font.scale.bitmap.min.ko",       16);
pref("font.scale.bitmap.undersize.ko", 80);
pref("font.scale.bitmap.oversize.ko",  120);

pref("font.scale.outline.min.zh-CN",      10);
pref("font.scale.aa_bitmap.min.zh-CN",    12);
pref("font.scale.aa_bitmap.always.zh-CN", false);
pref("font.scale.bitmap.min.zh-CN",       16);
pref("font.scale.bitmap.undersize.zh-CN", 80);
pref("font.scale.bitmap.oversize.zh-CN",  120);

pref("font.scale.outline.min.zh-TW",      10);
pref("font.scale.aa_bitmap.min.zh-TW",    12);
pref("font.scale.aa_bitmap.always.zh-TW", false);
pref("font.scale.bitmap.min.zh-TW",       16);
pref("font.scale.bitmap.undersize.zh-TW", 80);
pref("font.scale.bitmap.oversize.zh-TW",  120);

pref("font.scale.outline.min.zh-HK",      10);
pref("font.scale.aa_bitmap.min.zh-HK",    12);
pref("font.scale.aa_bitmap.always.zh-HK", false);
pref("font.scale.bitmap.min.zh-HK",       16);
pref("font.scale.bitmap.undersize.zh-HK", 80);
pref("font.scale.bitmap.oversize.zh-HK",  120);

// minimum font sizes

pref("font.min-size.variable.ja", 10);
pref("font.min-size.fixed.ja", 10);

pref("font.min-size.variable.ko", 10);
pref("font.min-size.fixed.ko", 10);

pref("font.min-size.variable.zh-CN", 10);
pref("font.min-size.fixed.zh-CN", 10);

pref("font.min-size.variable.zh-TW", 10);
pref("font.min-size.fixed.zh-TW", 10);

pref("font.min-size.variable.zh-HK", 10);
pref("font.min-size.fixed.zh-HK", 10);

// X11 specific
/* X11 font accept/reject patterns:
 * Patterns have to match against strings like this:
 * (boolean values can only be "true" or "false")
 * "fname=.*;scalable=.*;outline_scaled=.*;xdisplay=.*;xdpy=%d;ydpy=%d;xdevice=.*"
 * - fname     = X11 font name (string)
 * - scalable  = is font scalable ? (boolean)
 * - outline_scaled = is font an outline scaled font ? (boolean)
 * - xdisplay  = X11 display name (like "host:0.0" (string)
 * - xdpy      = X DPI (X screen resolution) (integer)
 * - ydpy      = Y DPI (Y screen resolution) (integer)
 * - xdevice   = "display" or "printer" (Xprint)
 * Patterns use  the regular expressions described in the EXTENDED REGULAR
 * EXPRESSIONS section of the regex(5) manual page.
 * Note that prefs strings can always be concatenated via the '+'-operator,
 * e.g. pref("font.x11.acceptfontpattern", "pattern1|" + 
 *                                         "pattern2|" +
 *                                         "pattern3");
 */
/* reject font if accept pattern does not match it... */
//pref("font.x11.acceptfontpattern", ".*");
/* reject font if reject pattern matches it... */
//pref("font.x11.rejectfontpattern", 
//     "fname=-urw.*;scalable=false;outline_scaled=false;xdisplay=.*;xdpy=.*;ydpy=.*;xdevice=.*");

/* PostScript print module prefs */
// pref("print.postscript.enabled",      true);
pref("print.postscript.paper_size",    "letter");
pref("print.postscript.orientation",   "portrait");
pref("print.postscript.print_command", "lpr ${MOZ_PRINTER_NAME:+'-P'}${MOZ_PRINTER_NAME}");

/* PostScript print module font config
 * this list is used by the postscript font
 * to enumerate the list of langGroups
 * there should be a call to get the
 * langGroups; see bug 75054
 */
pref("print.postscript.nativefont.ar",             "");
pref("print.postscript.nativefont.el",             "");
pref("print.postscript.nativefont.he",             "");
pref("print.postscript.nativefont.ja",             "");
pref("print.postscript.nativefont.ko",             "");
pref("print.postscript.nativefont.th",             "");
pref("print.postscript.nativefont.tr",             "");
pref("print.postscript.nativefont.x-baltic",       "");
pref("print.postscript.nativefont.x-central-euro", "");
pref("print.postscript.nativefont.x-cyrillic",     "");
pref("print.postscript.nativefont.x-unicode",      "");
pref("print.postscript.nativefont.x-user-def",     "");
pref("print.postscript.nativefont.x-western",      "");
pref("print.postscript.nativefont.zh-CN",          "");
pref("print.postscript.nativefont.zh-TW",          "");
pref("print.postscript.nativefont.zh-HK",          "");


//pref("content.max.tokenizing.time", 2250000);
pref("content.max.tokenizing.time", 100000);
//pref("content.notify.backoffcount", 0);
pref("content.notify.backoffcount", -1);
//pref("content.interrupt.parsing", false);
pref("content.interrupt.parsing", true);
pref("content.notify.interval", 750000);
//pref("content.notify.ontimer", false);
pref("content.notify.ontimer", false);

pref("content.switch.threshold", 500000);
pref("nglayout.initialpaint.delay", -3);
pref("nglayout.frame.constructor.signals", 5);
pref("content.perf.interrupts.count", 3);
pref("security.warn_entering_secure", false);
pref("security.warn_entering_weak", false);
pref("security.warn_leaving_secure", false);
pref("security.warn_submit_insecure", false);
pref("dom.max_script_run_time", 40);
pref("dom.disable_window_status_change", true);

pref("layout.xml.prettyprint", true);
pref("browser.sessionhistory.max_entries", 31);

pref("dom.window.useragent.policy", true);
pref("ua.policy.mail.google.com", "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.4.0) Gecko/20070423 Firefox/0.8");

pref("capability.policy.policynames", "mousedown");
pref("capability.policy.mousedown.sites", "http://mail.google.com http://aa.com");
pref("capability.policy.mousedown.HTMLDocument.mousedown", "noAccess");
pref("dom.jsevent.renamer", 1);
pref("dom.window.jsevents.policy", true);
pref("jsevent.renamer.mousedown", "click");

pref("extensions.update.enabled", false);
pref("extensions.checkCompatibility", false);

