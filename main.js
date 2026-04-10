  const requestMethod = document.querySelector("#method");
  const requestUrl = document.querySelector("#url");
  const headerText = document.querySelector("#headers")
  const requestBody = document.querySelector("#body");
  const requestText = document.querySelector("#request");
  const responseText = document.querySelector("#response");
  const submitButton = document.querySelector("#submit");

window.addEventListener('load', () => {
    if ( headerText.value === "") {
      headerText.value = '# "mode": "cors" # Accepted values cors, no-cors, same-origin' + '\n'
             + '# "Access-Control-Allow-Origin": "*" # e.g. http://www.example.com' + '\n'
             + '# "Authorization": "none"' + '\n'
    }
    if ( requestBody.value === "") {
      requestBody.value = '{\n  "name": "Stephen"\n}'
    }
}, {once: true});

  requestMethod.addEventListener("change", (event) => {
    if (requestMethod.value === "get" || requestMethod.value === "delete") {
      requestBody.classList.add("dimmed");
    } else {
      requestBody.classList.remove("dimmed");
    }
  })

  submitButton.addEventListener("click", async () => {
    const newHeaders = getHeaders(headerText.value)
    const request = getRequest(requestMethod.value, requestUrl.value, newHeaders, requestBody.value);
    requestText.value = await requestToText(request.clone())

    try {
      responseText.value = await fetch(request)
        .then(response => responseToText(response))
    } catch (error) {
      responseText.value = error.message;
    }
  });

  function getRequest(method, url, headers = null, body = "") {
    method = method.toLowerCase()
    if (headers === null) { headers = new Headers}
    if (method === "get" || method === "delete") {
      if (headers.has("content-type")) {
        headers.delete("content-type");
      }
      return new Request(url, {
        method: method.toUpperCase(),
        headers: headers
      });
    }
    if (!headers.has("content-type")) {
      headers.append("content-type", "application/json");
    }
    return new Request(url, {
      method: method.toUpperCase(),
      headers: headers,
      body: JSON.parse(JSON.stringify(body))
    });
  }

  function getHeaders(headerText) {
    const headerLines = headerText.split('\n');
    const headers = new Headers();
    if (headerLines)
    for (const line of headerLines) {
      if (line.startsWith("#")) { continue }
      const header = line.split('#')[0];
      if (header.length < 7) { continue }
      parts = header.split(':');
      if (parts.length !== 2) { continue }

      parts[0] = parts[0].trim()
      parts[1] = parts[1].trim()
      if (!parts[0].startsWith('"') || !parts[0].endsWith('"') || !parts[1].startsWith('"') || !parts[1].endsWith('"')) { continue}
      parts[0] = parts[0].replaceAll('"', '').toLowerCase()
      parts[1] = parts[1].replaceAll('"', '').toLowerCase()
      if (parts[0] === "" || parts[1] === "") {return}
      headers.append(parts[0], parts[1]);
    }
    return headers;
  }

  async function requestToText(request) {
    let headers = "";
    for (const pair of request.headers.entries()) {
      headers += `   ${pair[0]}: ${pair[1]}\n`;
    }

    if (headers !== "") {
      headers =  "headers:\n" + headers;
    }

    let body = "";
    if (request.method.toLowerCase() !== "get" && request.method.toLowerCase() !== "delete") {
      body = `body:\n${await new Response(request.body).text()}`;
    }

    const text = `method: ${request.method}\n`
                        + `url: ${request.url}\n`
                        + `mode: ${request.mode}\n`
                        + `destination: ${request.destination}\n`
                        + `credentials: ${request.credentials}\n`
                        + `redirect: ${request.redirect}\n`
                        + `referrer: ${request.referrer}\n`
                        + `referrerPolicy: ${request.referrerPolicy}\n`
                        + headers
                        + body
    return text
  }

  async function responseToText(response) {
    const contentType = response.headers.has("content-type") ? response.headers.get("content-type") : ""
    let headers = "";
    for (const pair of response.headers.entries()) {
      headers += `   ${pair[0]}: ${pair[1]}\n`;
    }

    if (headers !== "") {
      headers =  "headers:\n" + headers;
    }

    let body = "";
    const requestBody = await new Response(response.body);
    if (requestBody === null) {
      body = "body: null";
    } else {
      body = `body:\n${JSON.stringify(await requestBody.json(), null, 2)}`;
      if (requestBody instanceof Object) {

      }
    }

    const text = `status: ${response.status} ${response.statusText}\n`
                        + `url: ${response.url}\n`
                        + `redirected: ${response.redirected}\n`
                        + `type: ${response.type}\n`
                        + headers
                        + body

    return text
  }
