/**
 * Silas Tree & Turf — Shared Contact Form Handler
 * Submits to /api/contact (Resend serverless function on Vercel)
 */
(function () {
  'use strict';

  /**
   * Generic submit handler. Attach to any <form> element.
   * Options:
   *   source     - label shown in the email (e.g. "Contact Page", "Quick Widget")
   *   fields     - object mapping field keys → input selectors
   *   onSuccess  - callback(form) called after successful send
   *   onError    - callback(form, message) called on failure
   */
  function attachContactForm(form, { source = 'Website', fields = {}, onSuccess, onError } = {}) {
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"], button:not([type])');
      const originalText = btn ? btn.innerHTML : '';

      // Loading state
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg style="animation:spin 1s linear infinite;width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Sending…</span>';
      }

      // Build payload
      const payload = { source };
      for (const [key, selector] of Object.entries(fields)) {
        const el = form.querySelector(selector);
        payload[key] = el ? el.value.trim() : '';
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (res.ok && json.success) {
          if (onSuccess) {
            onSuccess(form);
          } else {
            showDefaultSuccess(form, btn, originalText);
          }
          form.reset();
        } else {
          throw new Error(json.error || 'Submission failed.');
        }
      } catch (err) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
        if (onError) {
          onError(form, err.message);
        } else {
          showDefaultError(form, err.message);
        }
      }
    });
  }

  function showDefaultSuccess(form, btn, originalText) {
    // Replace button with success message
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✅ Message Sent!';
      btn.style.background = '#54a029';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 4000);
    }
  }

  function showDefaultError(form, message) {
    let errEl = form.querySelector('.form-error-msg');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-error-msg';
      errEl.style.cssText = 'color:#dc2626;font-size:13px;margin-top:8px;font-weight:600;';
      form.appendChild(errEl);
    }
    errEl.textContent = '⚠ ' + (message || 'Something went wrong. Please try again.');
    setTimeout(() => errEl.remove(), 6000);
  }

  // Add spinner keyframes once
  if (!document.getElementById('st-form-styles')) {
    const style = document.createElement('style');
    style.id = 'st-form-styles';
    style.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────
  // AUTO-BIND: Contact Page — Main Inquiry Form
  // ─────────────────────────────────────────────────────
  const mainInquiryForm = document.querySelector('section form.space-y-6');
  if (mainInquiryForm) {
    attachContactForm(mainInquiryForm, {
      source: 'Contact Page — Main Form',
      fields: {
        name: '#fname, #name',
        email: '#cemail, #email',
        phone: '#cphone',
        message: '#cmessage, #message',
      },
    });
  }

  // ─────────────────────────────────────────────────────
  // AUTO-BIND: Footer "Let's Talk Trees" Form
  // ─────────────────────────────────────────────────────
  const footerForm = document.querySelector('footer form.space-y-8, footer form');
  if (footerForm) {
    attachContactForm(footerForm, {
      source: 'Footer Form',
      fields: {
        name: '#name',
        email: '#email',
        message: '#message',
      },
    });
  }

  // ─────────────────────────────────────────────────────
  // AUTO-BIND: Floating Widget Quick Form
  // ─────────────────────────────────────────────────────
  // The widget form doesn't have IDs — use placeholder-based selectors
  function bindWidgetForm() {
    // Try to find the widget form inside the fixed widget container
    const widget = document.querySelector('[x-data*="contactModal"]');
    if (!widget) return;

    const widgetForm = widget.querySelector('form');
    if (!widgetForm) return;

    const inputs = widgetForm.querySelectorAll('input, textarea');
    // Assign IDs if missing so we can target them
    inputs.forEach((el, i) => {
      if (!el.id) {
        const ph = el.placeholder ? el.placeholder.toLowerCase().replace(/[^a-z]/g, '_') : `widget_field_${i}`;
        el.id = `widget_${ph}`;
      }
    });

    attachContactForm(widgetForm, {
      source: 'Floating Widget',
      fields: {
        name: '[placeholder*="Name"], [id*="full_name"], [id*="widget_full"]',
        phone: '[placeholder*="Phone"], [id*="phone"]',
        message: '[placeholder*="help"], [id*="how_can"]',
      },
      onSuccess(form) {
        const btn = form.querySelector('button');
        if (btn) {
          btn.innerHTML = '✅ Sent!';
          btn.style.background = '#54a029';
          setTimeout(() => {
            btn.innerHTML = 'Send Message';
            btn.style.background = '';
          }, 3500);
        }
        form.reset();
      },
    });
  }

  // Wait for Alpine to finish rendering the widget
  document.addEventListener('alpine:initialized', bindWidgetForm);
  // Fallback for pages without Alpine or fast loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(bindWidgetForm, 500));
  } else {
    setTimeout(bindWidgetForm, 500);
  }

  // Expose for manual use
  window.silasForms = { attachContactForm };
})();
