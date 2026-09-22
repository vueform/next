/**
 * Joins a request URL with the configured `baseURL` exactly the way the fetch
 * adapter does. The origin gate in `createHttp.request` judges this same value,
 * so the URL that is policy-checked and the URL that is actually requested can
 * never drift apart — both call sites share this one definition.
 *
 * A URL is absolute (and skips the join) only when it starts with `http://` or
 * `https://`; everything else — including scheme-relative `//host` forms, which
 * the join collapses into the base path — is appended to the base. Without a
 * `baseURL` the URL passes through untouched.
 *
 * @param url The request URL from the config.
 * @param baseURL The configured base URL, if any.
 */
export function resolveRequestUrl(url: string, baseURL?: string): string {
  if (baseURL && !/^https?:\/\//i.test(url)) {
    return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
  }

  return url
}
