function toErrorMessage(widget, status, url) {
  return `${widget} data request failed with status ${status} for ${url}`;
}

export async function fetchJsonOrThrow(url, widget) {
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    const requestError = new Error(`${widget} data request failed for ${url}`);
    requestError.cause = error;
    requestError.widget = widget;
    requestError.url = url;
    throw requestError;
  }

  if (!response.ok) {
    const responseError = new Error(toErrorMessage(widget, response.status, url));
    responseError.widget = widget;
    responseError.url = url;
    responseError.status = response.status;
    throw responseError;
  }

  return response.json();
}
