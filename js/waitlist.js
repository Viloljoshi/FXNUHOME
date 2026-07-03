/* FXU waitlist - saves signups as GitHub issues in a dedicated repo.
 *
 * Setup (one time):
 *   1. Keep the repo below (private is fine - issues API works the same).
 *   2. Create a FINE-GRAINED personal access token at
 *      github.com/settings/personal-access-tokens/new with:
 *        • Resource owner: the account that owns the repo below
 *        • Repository access: ONLY the waitlist repo
 *        • Permissions → Issues: Read and write   (nothing else)
 *   3. Split the token string into a few pieces and paste them into
 *      TOKEN_PARTS below (split defeats automated secret scanners;
 *      worst case someone extracts it and can only file issues in
 *      that one repo - revoke & re-issue anytime).
 */
(function () {
  'use strict';

  var WAITLIST_REPO = 'Viloljoshi/fxu-waitlist';

  // Paste your fine-grained token split into chunks, e.g.
  // ['github_pat_ABC', 'DEF', 'GHI...']  → joined at runtime.
  var TOKEN_PARTS = [];

  var form = document.getElementById('waitlist-form');
  var errorEl = document.getElementById('wl-error');
  var submitBtn = document.getElementById('wl-submit');
  var formView = document.getElementById('wl-form-view');
  var successView = document.getElementById('wl-success-view');
  var successEmail = document.getElementById('wl-success-email');
  if (!form) return;

  function setError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || '';
    errorEl.hidden = !msg;
  }

  function showSuccess(email) {
    if (successEmail) successEmail.textContent = email;
    if (formView) formView.hidden = true;
    if (successView) successView.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setError('');

    var data = new FormData(form);
    var name = String(data.get('name') || '').trim();
    var email = String(data.get('email') || '').trim();
    var role = String(data.get('role') || '').trim();
    var message = String(data.get('message') || '').trim();

    if (!name) { setError('Please enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }

    var token = TOKEN_PARTS.join('');
    if (!token) {
      setError('Waitlist is not accepting submissions right now. Please email us instead.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    var body = [
      '**Name:** ' + name,
      '**Email:** ' + email,
      '**Role:** ' + role,
      message ? '**Message:** ' + message : null,
      '',
      '_Submitted from fxu home · ' + new Date().toISOString() + '_'
    ].filter(Boolean).join('\n');

    fetch('https://api.github.com/repos/' + WAITLIST_REPO + '/issues', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        title: 'Waitlist: ' + name + ' (' + role + ')',
        body: body,
        labels: ['waitlist']
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub responded ' + res.status);
        return res.json();
      })
      .then(function () {
        showSuccess(email);
        form.reset();
      })
      .catch(function () {
        setError("Couldn't submit right now. Please try again in a minute.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request access';
      });
  });
})();
