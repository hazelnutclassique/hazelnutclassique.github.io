(function () {
  // Scalable Text with SVG
  // no library dependencies
  var fallback_title, page_title, supportsSVG, svgDoc, textNode, title, title_text;

  supportsSVG = function () {
    return !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
  };

  if (supportsSVG) {
    fallback_title = document.querySelector("#fallback-title");
    fallback_title.setAttribute("style", "display:none;");
    title_text = fallback_title.childNodes[0].nodeValue;
    page_title = document.querySelector("#page-title");
    svgDoc = document.querySelector("#svg-title");
    title = document.createElementNS('http://www.w3.org/2000/svg', "text");
    title.setAttributeNS(null, "x", '50%');
    title.setAttributeNS(null, "y", '50%');
    title.setAttributeNS(null, "text-anchor", 'middle');
    textNode = document.createTextNode(title_text);
    svgDoc.appendChild(title);
    title.appendChild(textNode);
  }

}).call(this);


//# sourceURL=coffeescript