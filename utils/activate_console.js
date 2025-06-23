var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
console.log = iframe.contentWindow.console.log;