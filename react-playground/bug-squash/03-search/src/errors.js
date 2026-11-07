/**
 * Any problem with a query the user typed. `position` is the character offset
 * in the query string where the problem was found, when known, so the UI can
 * underline it.
 */
export class QueryError extends Error {
  constructor(message, position = null) {
    super(message);
    this.name = "QueryError";
    this.position = position;
  }
}
