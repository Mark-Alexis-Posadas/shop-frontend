# Customer session recovery and storefront resilience

## Previous gaps

Login and registration ignored protected-route return locations. The API had no
response-side session recovery, and restoration treated 403 as expiration.
Account changes cleared public product discovery alongside private data. Guests
received an add-to-cart error rather than a sign-in path. Broken image URLs had no
fallback. Late cart/cancellation responses could repopulate cleared private caches.

## Behavior

The customer API response interceptor handles 401 only for the existing cart,
orders and auth/me requests carrying the CURRENT bearer token. Login/register,
public product failures, network errors, 403 and 5xx never trigger expiration.
After expiration, the stored token/profile are cleared and protected queries are
cancelled and removed, along with private mutation cache entries. Product queries,
filters and URL history remain intact. Late responses for a different token cannot
expire the active account. No refresh token, admin or backend behavior is changed.

Protected routes preserve the attempted location and redirect guests to login.
Public browsing never forces login because of a background cart failure. A saved
token whose account cannot be verified due to connectivity/403 is retained;
protected routes show Retry session check, which reloads the current URL. This also
keeps auth pages reachable. Session restoration itself remains bounded by the
existing Axios timeout. Confirmed expiration shows a sign-in notice.

Login/register use a whitelist of actual storefront paths, reject external,
protocol-relative, backslash, control-character, dot-segment, auth and admin paths,
and replace the auth history entry on success. Location search/hash and a validated
listing return URL survive the login/register transition. Return intent is kept in
router state, not persisted storage. Guests can explicitly sign in from product
or cart destinations. No cart is created and no product is automatically added.

Logout and successful authentication remove only private customer caches. Normal
navigation preserves the signed-in cart. In-flight cart/create/cancellation
callbacks check the submitting session before updating caches; old checkout
responses cannot navigate a new account to the previous account's order. Existing
revision/409 cart protection, stock transactions, cancellation rules, COD collection
and pricing remain unchanged. Synchronous click guards complement pending buttons.

ProductImage supplies an accessible missing/broken-image fallback on product,
cart, checkout and order views. Network errors are actionable, unavailable products
have a browsing path, and guest add-to-cart guidance is explicit. No dependency or
payment integration was added.

## Verification and limits

Automated tests use Axios adapters, isolated QueryClients, controlled promises,
SSR and memory-router navigation. No browser test framework is installed. Verify
real redirects, image load failures, focus and responsive behavior manually:

1. Open checkout as a guest; sign in or register and confirm return to checkout.
2. Open a product from a filtered catalog, sign in from Add to Cart, then return
   through the Products breadcrumb. Confirm nothing was added automatically.
3. Expire/delete a session and call cart/orders; confirm one login redirect for
   protected pages, preserved destination, and no private cache after expiration.
4. Simulate offline/500/403: credentials remain, and retry becomes available.
5. Log out A and log in B while an A cart/cancellation request is paused. Ensure
   A's private data is not rendered or reinserted. Product caches remain present.
6. Test missing and deliberately broken image URLs, deactivated products, rapid
   repeated clicks, stale-cart conflicts, and ordinary COD checkout/cancellation.

Tokens retain the existing localStorage persistence and JWT lifetime. This task
adds no cross-tab session synchronization or server-side token/session redesign.
A failed checkout response may hide a committed order; check My Orders before
retrying, as indicated by the fallback error. Form data is not persisted across
session recovery. Admin uses its separate application and is unchanged.
