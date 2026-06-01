/** Standard server-action result shape. */
export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string };

export type ActionOk<T = void> = Extract<ActionResult<T>, { ok: true }>;
export type ActionErr = Extract<ActionResult<unknown>, { ok: false }>;
