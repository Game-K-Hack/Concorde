const funcbwspsrh = srh.ajax.buildWSParameter
srh.ajax.buildWSParameter = function (d) {
  alert(JSON.stringify(d));
  return funcbwspsrh(d);
}