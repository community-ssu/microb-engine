function initialize() {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var b = {};
  function c() {
    function accum(module, key, value) {
      if (!(module in b))
        b[module] = {};
      b[module][key] = value;
    }
    twib = function twib(module) {
      var o = '';
      var keys = b[module];
      o+="<table><tbody>";
      for (var key in keys) {
        var value = keys[key];
        if (!value)
          continue;
        if (/:\/\//.test(value))
          value = '<a href="'+value+'"><img border="0" src="'+value+'" alt="'+value+'" /></a>';
        value = value.replace(/&amp;/g,'&').replace(/&/g,'&amp;');
        o += "<tr><th>"+ key + "</th><td>" + value +"</td></tr>";
      }
      o+="</tbody></table>";
      return o;
    }
  
    function flush() {
      var o = '';
      for (var module in b) {
        o+=twib(module);
      }
      b = {};
      return o;
    }
    const PREFIX_NS_EM = "http://www.mozilla.org/2004/em-rdf#";
    var Cc=Components.classes;
    var Ci=Components.interfaces;
    var rdfs = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService)
    var ds = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager).datasource;
/*
    try {
      // Crashes here, fixed somewhere between /firefox-2006-08-04-04-trunk and /firefox-2006-08-05-04-trunk
      var ds=rdfs.GetDataSource('rdf:extensions');
    } catch (e) {
      var ds = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager).datasource;
    }
*/
    var ctr = Cc["@mozilla.org/rdf/container;1"].createInstance(Ci.nsIRDFContainer);
    ctr.Init(ds, rdfs.GetResource('urn:mozilla:item:root'));
  
    var elements = ctr.GetElements();
    while (elements.hasMoreElements()) {
      var e = elements.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
      var i = ds.ArcLabelsOut(e);
      var arc;
      var module = e.ValueUTF8.replace("urn:mozilla:item:","");
      while (i.hasMoreElements() && (arc = i.getNext().nsIRDFResource)) {
        var key = arc.ValueUTF8.replace(/.*#/,'');
        if (/^(?:type|name|version|iconURL|targetApplication)$/.test(key))
          continue;
        var target = ds.GetTarget(e, arc, true);
        if (!target)
          continue;
        if (target instanceof Components.interfaces.nsIRDFLiteral)
          var value = target.Value;
        else if (target instanceof Components.interfaces.nsIRDFResource)
          value = target.ValueUTF8;
        else if (target instanceof Components.interfaces.nsIRDFInt)
          value = '' + target.Value;
        else
          value = '';
  
        accum(module, key, value);
      }
    }
  }
  
  var data = '';
  function append(text) {
    data += text;
  }
  function flush() {
    document.getElementById('generated').innerHTML = data; data = '';
  }
  function link(href, text) {
    return href && href != "none" ? "<a href='"+href.replace(/&/g,'&amp;')+"'>"+text+"</a>" : "";
  }
  const PREF_EM_ITEM_UPDATE_URL         = "extensions.%UUID%.update.url";

  var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
  var gPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  var updateItem = Components.interfaces.nsIUpdateItem;
  var consts = {};
  var k;
  c();
  for (var i in updateItem)
    if ((k=updateItem[i])+0==k)
      consts[k] = i.replace(/.*_/,'').toLowerCase();
  var list = em.nsIExtensionManager.getItemList(updateItem.TYPE_ANY, {});
  append("<table border='1'><tr><th>Name</th><th>Version</th></tr><tr><th>More</th><th>Range</th></tr>");
  for (i = 0; i < list.length; ++i) {
    var item=list[i];
    append("<tr><th>"+
    "<i><img src='"+item.iconURL+"' alt=' (icon unavailable) '/></i>"
+item.name+"</th><td>"+item.version+
"</td></tr><tr><td align='center'>"+
    "<img class='"+consts[item.type]+"' alt='"+consts[item.type]+"'/> "+
    link(item.xpiURL, "origin")+
" "+link(item.updateRDF, "update information")+
"</td><td>"+item.minAppVersion+" ... "+item.maxAppVersion+
"</td></tr><tr><td colspan='2'>"+twib(item.id)+"</td></tr>");
  }
  append("</table>");
  flush();
}
