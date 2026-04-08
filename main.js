  const requestMethod = document.querySelector("#method");
  const requestUrl = document.querySelector("#url");
  const requestBody = document.querySelector("#body");
  const requestText = document.querySelector("#request");
  const responseText = document.querySelector("#response");
  const submitButton = document.querySelector("#submit");

  submitButton.addEventListener("click", async () => {
      let request

      if (requestMethod.value === "get" || requestMethod.value === "delete") {
        request = new Request(requestUrl.value, {
          method: requestMethod.value
        });
      } else {
          request = new Request(requestUrl.value, {
          method: requestMethod.value,
          body: JSON.stringify(requestBody.value)
        });
      }
      console.log(requestMethod.value)
      console.log(requestUrl.value)
      console.log(requestBody.value)
      console.log(request)

      requestText.value = request.url
    try {
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const result = await response.json();
      responseText.value = result;
      console.log(result)
    } catch (error) {
      responseText.value = error.message;
    }
  });
