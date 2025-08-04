//reads a server-side file

// revise? https://www.w3schools.com/xml/tryit.asp?filename=try_dom_xmlhttprequest_responsexml

export function readLocalFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
};
