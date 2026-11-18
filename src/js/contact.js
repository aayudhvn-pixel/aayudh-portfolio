// 4.8 Contact: the copy-email button and the form.
// The form posts to Web3Forms (https://web3forms.com), which emails each
// message to Aayudh. The access key is public by design (it only lets the form
// send to his inbox). Without JS the form still posts normally.

const KEY_PLACEHOLDER = 'YOUR-WEB3FORMS-ACCESS-KEY';

export function initContact() {
  initCopy();
  initForm();
}

function initCopy() {
  const btn = document.querySelector('.copy-btn');
  if (!btn || !navigator.clipboard) return;
  btn.hidden = false;
  let timer;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied';
      btn.classList.add('is-done');
    } catch {
      btn.textContent = 'Copy failed';
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('is-done');
    }, 2000);
  });
}

function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const status = form.querySelector('.contact-form__status');
  const submit = form.querySelector('[type="submit"]');
  const key = form.dataset.accessKey;

  // Hidden fields Web3Forms reads (added here so the no-JS post still works
  // once the key is in the markup).
  const hidden = { access_key: key, subject: 'New message from your portfolio', from_name: 'Portfolio contact form' };
  for (const [name, value] of Object.entries(hidden)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.prepend(input);
  }

  const say = (text, kind = '') => {
    status.textContent = text;
    status.className = `contact-form__status${kind ? ` is-${kind}` : ''}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('was-tried');
    if (!form.checkValidity()) {
      const bad = form.querySelector(':invalid:not([type="hidden"])');
      bad?.focus();
      say(bad?.type === 'email' && bad.value ? 'Please enter a valid email.' : 'Please fill in every field.', 'error');
      return;
    }
    if (!key || key === KEY_PLACEHOLDER) {
      say('The form isn’t connected yet. Please email me directly.', 'error');
      return;
    }

    submit.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || res.status);
      form.reset();
      form.classList.remove('was-tried');
      say('Thanks! Your message is on its way. I’ll reply soon.', 'ok');
    } catch {
      say('Something went wrong. Please email me directly.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
}
