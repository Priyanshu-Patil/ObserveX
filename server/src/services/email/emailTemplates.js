/**
 * Email templates for ObserveX (redesigned: minimal, light-first, dark-mode aware).
 *
 * 1.  Super Admin account created
 * 2.  Password reset request
 * 3.  Password changed confirmation
 * 4.  Successful login notification
 * 5.  Inactive-account login alert
 * 6.  Client workspace created
 * 7.  Client team member welcome
 * 8.  API key created
 * 9.  API key rotated
 * 10. API key revoked
 *
 * All exports keep their original names and signatures: each returns { subject, html, text }.
 */

const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const BRAND = 'ObserveX';

// Logo lives in dashboard/public/1.png, which the frontend serves at /1.png.
// Email clients can't read local files, so this must be a publicly reachable URL.
// Override with LOGO_URL (e.g. a CDN link) if the dashboard isn't public.
const LOGO_URL = process.env.LOGO_URL || `${APP_URL.replace(/\/+$/, '')}/1.png`;
// Set EMAIL_LOGO_WITH_NAME=false if your logo already contains the "ObserveX" name.
const SHOW_WORDMARK = process.env.EMAIL_LOGO_WITH_NAME !== 'false';

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                  */
/* -------------------------------------------------------------------------- */

/** Escapes HTML characters to prevent XSS / injection in email clients. */
export function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Only allow http(s)/mailto links in href attributes. */
function safeUrl(url) {
    const value = String(url || '').trim();
    return /^(https?:\/\/|mailto:)/i.test(value) ? escapeHtml(value) : '#';
}

const now = () => new Date().toUTCString();

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace";

const TONES = {
    brand:   { accent: '#6366F1', tint: 'rgba(99, 102, 241, 0.10)', label: 'Notice' },
    success: { accent: '#059669', tint: 'rgba(16, 185, 129, 0.10)', label: 'Success' },
    warning: { accent: '#D97706', tint: 'rgba(245, 158, 11, 0.12)', label: 'Attention' },
    danger:  { accent: '#DC2626', tint: 'rgba(239, 68, 68, 0.10)',  label: 'Security alert' },
};

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                            */
/* -------------------------------------------------------------------------- */

/** Small status pill shown above the headline. */
function eyebrow(text, tone = 'brand') {
    const t = TONES[tone];
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 16px 0;">
        <tr>
          <td style="background-color: ${t.tint}; color: ${t.accent}; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; padding: 5px 10px; border-radius: 999px;">
            ${escapeHtml(text)}
          </td>
        </tr>
      </table>`;
}

function heading(text) {
    return `<h1 class="ox-h" style="margin: 0 0 12px 0; font-size: 22px; line-height: 30px; font-weight: 700; letter-spacing: -0.3px; color: #111827;">${escapeHtml(text)}</h1>`;
}

/** Paragraph. `html` is trusted markup (values must already be escaped). */
function paragraph(html, { last = false } = {}) {
    return `<p class="ox-p" style="margin: 0 0 ${last ? '0' : '24px'} 0; font-size: 15px; line-height: 24px; color: #4B5563;">${html}</p>`;
}

const strong = (v) => `<strong class="ox-h" style="color: #111827; font-weight: 600;">${escapeHtml(v)}</strong>`;

/**
 * Details table: bordered, rounded, with a header row and a shaded label column.
 * rows: [label, value, { mono?, color?, bold?, upper? }]
 */
function details(rows, title = 'Details') {
    const visible = rows.filter((r) => r && r[1] !== undefined && r[1] !== null && r[1] !== '');
    const body = visible
        .map(([label, value, opts = {}], i) => {
            const border = i === visible.length - 1 ? '' : 'border-bottom: 1px solid #E5E7EB;';
            const valueStyle = [
                'padding: 11px 16px',
                'font-size: 14px',
                'line-height: 20px',
                `color: ${opts.color || '#111827'}`,
                `font-weight: ${opts.bold ? 600 : 500}`,
                'word-break: break-word',
                'vertical-align: top',
                opts.mono ? `font-family: ${MONO}; font-size: 13px` : '',
                opts.upper ? 'text-transform: uppercase; letter-spacing: 0.5px' : '',
                border,
            ].filter(Boolean).join('; ');
            return `
          <tr>
            <td class="ox-lbl ox-line ox-muted" width="36%" style="width: 36%; padding: 11px 16px; font-size: 13px; line-height: 20px; color: #6B7280; background-color: #F9FAFB; border-right: 1px solid #E5E7EB; vertical-align: top; ${border}">${escapeHtml(label)}</td>
            <td class="ox-val ox-line" style="${valueStyle}">${escapeHtml(value)}</td>
          </tr>`;
        })
        .join('');

    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="ox-line" style="margin: 0 0 28px 0; border: 1px solid #E5E7EB; border-radius: 10px; border-collapse: separate; border-spacing: 0; overflow: hidden;">
        <tr>
          <td colspan="2" class="ox-th ox-muted ox-line" style="padding: 10px 16px; background-color: #F3F4F6; border-bottom: 1px solid #E5E7EB; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #6B7280;">${escapeHtml(title)}</td>
        </tr>
        ${body}
      </table>`;
}

/** Primary call-to-action (bulletproof button + plain link fallback). */
function button(label, url, tone = 'brand') {
    const href = safeUrl(url);
    const { accent } = TONES[tone];
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 12px 0;">
        <tr>
          <td align="center" bgcolor="${accent}" style="border-radius: 8px; background-color: ${accent};">
            <a href="${href}" target="_blank" style="display: inline-block; padding: 13px 26px; font-size: 14px; font-weight: 600; line-height: 20px; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-family: ${FONT};">
              ${escapeHtml(label)}
            </a>
          </td>
        </tr>
      </table>`;
}

/** Secondary "copy this link" fallback, shown under the CTA. */
function linkFallback(url) {
    const href = safeUrl(url);
    return `
      <p class="ox-muted" style="margin: 0 0 28px 0; font-size: 12px; line-height: 18px; color: #6B7280; word-break: break-all;">
        Or paste this link into your browser:<br>
        <a href="${href}" style="color: #6366F1; text-decoration: underline;">${href}</a>
      </p>`;
}

/** Spacer used when a CTA has no fallback link. */
const spacer = (h = 16) => `<div style="height: ${h}px; line-height: ${h}px; font-size: 1px;">&nbsp;</div>`;

/** Subtle note block with a coloured accent bar. */
function callout(title, html, tone = 'brand') {
    const t = TONES[tone];
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${t.tint}; border-radius: 8px;">
        <tr>
          <td width="3" style="width: 3px; background-color: ${t.accent}; border-radius: 8px 0 0 8px; font-size: 0; line-height: 0;">&nbsp;</td>
          <td class="ox-p" style="padding: 14px 18px; font-size: 13px; line-height: 20px; color: #4B5563;">
            <strong style="color: ${t.accent}; font-weight: 600;">${escapeHtml(title)}</strong><br>
            ${html}
          </td>
        </tr>
      </table>`;
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                     */
/* -------------------------------------------------------------------------- */

function baseLayout({ title, preheader, bodyHtml, tone = 'brand' }) {
    const { accent } = TONES[tone];
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @media (prefers-color-scheme: dark) {
      .ox-body  { background-color: #0B0F19 !important; }
      .ox-card  { background-color: #111827 !important; border-color: #1F2937 !important; }
      .ox-h     { color: #F9FAFB !important; }
      .ox-p     { color: #D1D5DB !important; }
      .ox-val   { color: #F3F4F6 !important; }
      .ox-muted { color: #9CA3AF !important; }
      .ox-line  { border-color: #1F2937 !important; }
      .ox-th    { background-color: #0D131F !important; }
      .ox-lbl   { background-color: #0D131F !important; }
      .ox-foot  { color: #6B7280 !important; }
    }
    @media only screen and (max-width: 600px) {
      .ox-pad { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body class="ox-body" style="margin: 0; padding: 0; background-color: #F4F5F7; font-family: ${FONT}; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #F4F5F7;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="ox-body" style="background-color: #F4F5F7;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Brand -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px;">
          <tr>
            <td class="ox-h" align="center" style="padding: 0 4px 28px 4px; font-size: 32px; font-weight: 800; letter-spacing: -1px; line-height: 40px; color: #111827;">ObserveX</td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="ox-card" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px;">
          <tr>
            <td class="ox-pad" style="padding: 36px 40px 40px 40px;">
              ${bodyHtml}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px;">
          <tr>
            <td class="ox-foot" align="center" style="padding: 24px 16px 0 16px; font-size: 12px; line-height: 18px; color: #9CA3AF;">
              This is an automated message from ${BRAND}. Please do not reply.<br>
              &copy; ${year} ${BRAND} &middot; API Monitoring &amp; Observability
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text twin for every email. */
function buildText({ title, greeting, intro, rows = [], cta, note }) {
    const lines = [`${BRAND} - ${title}`, ''];
    if (greeting) lines.push(greeting, '');
    if (intro) lines.push(intro, '');
    const shown = rows.filter((r) => r && r[1] !== undefined && r[1] !== null && r[1] !== '');
    if (shown.length) {
        shown.forEach(([k, v]) => lines.push(`- ${k}: ${v}`));
        lines.push('');
    }
    if (cta) lines.push(`${cta.label}:`, cta.url, '');
    if (note) lines.push(note, '');
    lines.push(`(c) ${new Date().getFullYear()} ${BRAND}. All rights reserved.`);
    return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/*  1. Super Admin account created                                             */
/* -------------------------------------------------------------------------- */

export function superAdminCreatedTemplate({ username, email, loginUrl = `${APP_URL}/login` }) {
    const subject = 'Welcome to ObserveX – Super Admin Account Created';
    const preheader = `Your Super Admin account (@${username}) is ready.`;
    const rows = [
        ['Username', username, { bold: true }],
        ['Email', email],
        ['Role', 'Super Admin (full root access)', { color: '#059669', bold: true }],
    ];

    const bodyHtml = `
      ${eyebrow('Account created', 'success')}
      ${heading('Your Super Admin account is ready')}
      ${paragraph(`Hello ${strong(username)}, welcome to ObserveX. Your account has been provisioned with full administrative access.`)}
      ${details(rows)}
      ${button('Open dashboard', loginUrl)}
      ${linkFallback(loginUrl)}
      ${callout('Keep your credentials safe', 'Super Admin access covers API traffic, tenant workspaces and API keys. Never share your login details.')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: 'Super Admin Account Created',
            greeting: `Hello ${username},`,
            intro: 'Your Super Admin account has been provisioned with full administrative access.',
            rows,
            cta: { label: 'Log in', url: loginUrl },
            note: 'Security reminder: Super Admin credentials grant unrestricted access to API traffic, tenant workspaces and API keys. Keep them confidential.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  2. Password reset                                                          */
/* -------------------------------------------------------------------------- */

export function passwordResetTemplate({ username, email, resetUrl, expiresMinutes = 60 }) {
    const subject = 'ObserveX – Password Reset Request';
    const preheader = `Reset your password. This link expires in ${expiresMinutes} minutes.`;

    const bodyHtml = `
      ${eyebrow('Password reset', 'brand')}
      ${heading('Reset your password')}
      ${paragraph(`Hello ${strong(username)}, we received a request to reset the password for your ObserveX account. This link can be used once and expires in ${strong(`${expiresMinutes} minutes`)}.`)}
      ${button('Reset password', resetUrl)}
      ${linkFallback(resetUrl)}
      ${callout("Didn't request this?", 'You can safely ignore this email. Your password will not change unless you use the link above.', 'warning')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: 'Password Reset Request',
            greeting: `Hello ${username},`,
            intro: `We received a request to reset the password for your ObserveX account. The link below is valid for ${expiresMinutes} minutes and can be used once.`,
            cta: { label: 'Reset your password', url: resetUrl },
            note: 'If you did not request this, you can safely ignore this email. Your password will remain unchanged.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  3. Password changed                                                        */
/* -------------------------------------------------------------------------- */

export function passwordChangedTemplate({ username, email, timestamp, ipAddress = 'Unknown IP', userAgent = 'Unknown Device', loginUrl = `${APP_URL}/login` }) {
    const subject = 'ObserveX – Password Successfully Changed';
    const preheader = 'Your ObserveX password was changed.';
    const when = timestamp || now();
    const rows = [
        ['Account', username, { bold: true }],
        ['Time', when],
        ['IP address', ipAddress, { mono: true }],
        ['Device', userAgent],
    ];

    const bodyHtml = `
      ${eyebrow('Security confirmation', 'success')}
      ${heading('Your password was changed')}
      ${paragraph(`Hello ${strong(username)}, the password for your ObserveX account was updated. Here are the details of the change.`)}
      ${details(rows)}
      ${callout("Wasn't you?", 'Your account may be compromised. Contact your system administrator immediately so the account can be locked down.', 'danger')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: 'Password Successfully Changed',
            greeting: `Hello ${username},`,
            intro: 'The password for your ObserveX account was successfully changed.',
            rows,
            note: 'If you did not make this change, contact your system administrator immediately to protect your account.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  4. Successful login                                                        */
/* -------------------------------------------------------------------------- */

export function successfulLoginTemplate({ username, email, timestamp, ipAddress = 'Unknown IP', userAgent = 'Unknown Device', appUrl = APP_URL }) {
    const subject = 'ObserveX – Successful Login Notification';
    const preheader = `New sign-in to your account (@${username}).`;
    const when = timestamp || now();
    const rows = [
        ['Account', username, { bold: true }],
        ['Time', when],
        ['IP address', ipAddress, { mono: true }],
        ['Device', userAgent],
    ];

    const bodyHtml = `
      ${eyebrow('New sign-in', 'brand')}
      ${heading('New login detected')}
      ${paragraph(`Hello ${strong(username)}, we noticed a successful sign-in to your ObserveX account.`)}
      ${details(rows)}
      ${button('Go to dashboard', appUrl)}
      ${spacer(16)}
      ${callout('Not you?', 'If you do not recognise this login, change your password right away.', 'warning')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: 'Successful Login Notification',
            greeting: `Hello ${username},`,
            intro: 'A successful login to your ObserveX account was detected.',
            rows,
            cta: { label: 'Go to dashboard', url: appUrl },
            note: 'If this was you, no action is needed. If you do not recognise this activity, reset your password immediately.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  5. Inactive-account login alert                                            */
/* -------------------------------------------------------------------------- */

export function inactiveAccountAlertTemplate({ username, email, timestamp, ipAddress = 'Unknown IP', userAgent = 'Unknown Device' }) {
    const subject = 'SECURITY ALERT: Login Attempt on Inactive ObserveX Account';
    const preheader = `A sign-in attempt was blocked on your deactivated account (@${username}).`;
    const when = timestamp || now();
    const rows = [
        ['Account', username, { bold: true }],
        ['Status', 'Deactivated – login blocked', { color: '#DC2626', bold: true }],
        ['Attempt time', when],
        ['Source IP', ipAddress, { mono: true }],
        ['User agent', userAgent],
    ];

    const bodyHtml = `
      ${eyebrow('Security alert', 'danger')}
      ${heading('Login attempt blocked')}
      ${paragraph(`Someone tried to sign in to ${strong(username)}, which is currently deactivated. The attempt was rejected.`)}
      ${details(rows)}
      ${callout('What to do', 'If this was not you, your credentials may be known to someone else. To reactivate the account or get help, contact your ObserveX workspace administrator.', 'danger')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml, tone: 'danger' }),
        text: buildText({
            title: 'SECURITY ALERT: Inactive Account Login Attempt',
            greeting: `Security notice for ${username},`,
            intro: 'A sign-in attempt to your deactivated account was detected and blocked.',
            rows,
            note: 'If you did not initiate this attempt, someone else may have your credentials. To reactivate the account, contact your system administrator.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  6. Client workspace created                                                */
/* -------------------------------------------------------------------------- */

export function clientCreatedTemplate({
    clientName,
    slug,
    email,
    website = '',
    description = '',
    createdByUsername = 'Super Admin',
    dashboardUrl = `${APP_URL}/admin/clients`,
}) {
    const subject = `Welcome to ObserveX – Workspace Created: ${clientName}`;
    const preheader = `Your workspace "${clientName}" is ready.`;
    const rows = [
        ['Workspace', clientName, { bold: true }],
        ['Slug', slug, { mono: true, color: '#6366F1' }],
        ['Contact email', email],
        ['Website', website],
        ['Provisioned by', createdByUsername],
    ];

    const bodyHtml = `
      ${eyebrow('Workspace created', 'success')}
      ${heading('Your workspace is ready')}
      ${paragraph(`A dedicated workspace for ${strong(clientName)} has been set up on ObserveX. You can now create API keys and invite your team.`)}
      ${details(rows)}
      ${button('Open workspace', dashboardUrl)}
      ${spacer(16)}
      ${callout('Next steps', 'Generate an ingestion API key, then add the ObserveX middleware to your backend services to start seeing latency, status codes and error analytics in real time.')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: `Workspace Created: ${clientName}`,
            greeting: 'Hello,',
            intro: `A new workspace for "${clientName}" has been provisioned on ObserveX.`,
            rows,
            cta: { label: 'Open workspace', url: dashboardUrl },
            note: 'Next steps: generate an ingestion API key and configure it in your backend services to start collecting API telemetry.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  7. Client team member welcome                                              */
/* -------------------------------------------------------------------------- */

export function clientUserCreatedTemplate({
    username,
    email,
    role = 'client_viewer',
    clientName = 'ObserveX Client',
    loginUrl = `${APP_URL}/login`,
}) {
    const isClientAdmin = role === 'client_admin';
    const roleTitle = isClientAdmin ? 'Client Admin (full workspace access)' : 'Client Viewer (read-only analytics)';
    const roleColor = isClientAdmin ? '#6366F1' : '#0284C7';

    const subject = `You've been added to ${clientName} on ObserveX`;
    const preheader = `You now have access to "${clientName}" as ${isClientAdmin ? 'a Client Admin' : 'a Client Viewer'}.`;
    const rows = [
        ['Username', username, { bold: true }],
        ['Email', email],
        ['Workspace', clientName],
        ['Role', roleTitle, { color: roleColor, bold: true }],
    ];

    const bodyHtml = `
      ${eyebrow('Invitation', 'brand')}
      ${heading(`Welcome to ${clientName}`)}
      ${paragraph(`Hello ${strong(username)}, you've been added as a team member of the ${strong(clientName)} workspace on ObserveX.`)}
      ${details(rows)}
      ${button('Log in to ObserveX', loginUrl)}
      ${linkFallback(loginUrl)}
      ${callout('Update your password', 'Your initial credentials were set by your workspace administrator. After logging in, change your password under <em>Settings &rsaquo; Security &amp; Sessions</em>.')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: `Welcome to ${clientName}`,
            greeting: `Hello ${username},`,
            intro: `You have been added to the "${clientName}" workspace on ObserveX.`,
            rows,
            cta: { label: 'Log in', url: loginUrl },
            note: 'Please log in with the initial password set by your administrator and change it in Settings > Security & Sessions.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  8. API key created                                                         */
/* -------------------------------------------------------------------------- */

export function apiKeyCreatedTemplate({
    keyName,
    keyPrefix = 'apim_',
    environment = 'production',
    clientName = 'ObserveX Workspace',
    createdByUsername = 'Authorized User',
    timestamp,
    dashboardUrl = `${APP_URL}/admin/clients`,
}) {
    const isProd = String(environment).toLowerCase() === 'production';
    const subject = `ObserveX Security Notice – New API Key Created (${keyName})`;
    const preheader = `A new API key "${keyName}" was created in ${clientName}.`;
    const rows = [
        ['Key name', keyName, { bold: true }],
        ['Identifier', `${keyPrefix}••••••••`, { mono: true, color: '#6366F1' }],
        ['Environment', String(environment), { upper: true, bold: true, color: isProd ? '#DC2626' : '#059669' }],
        ['Workspace', clientName],
        ['Created by', createdByUsername],
        ['Created at', timestamp || now()],
    ];

    const bodyHtml = `
      ${eyebrow('API key', 'brand')}
      ${heading('New API key created')}
      ${paragraph(`A new API key was generated for the ${strong(clientName)} workspace.`)}
      ${details(rows)}
      ${button('Manage API keys', dashboardUrl)}
      ${spacer(16)}
      ${callout('Keep it secret', "API keys grant ingestion access to your workspace. Never commit them to Git or expose them in client-side code. If your team didn't create this key, revoke it immediately.", 'warning')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml }),
        text: buildText({
            title: `New API Key Created (${keyName})`,
            intro: `A new API key was created for workspace "${clientName}".`,
            rows,
            cta: { label: 'Manage API keys', url: dashboardUrl },
            note: 'Never expose API keys in frontend apps or public repositories. If this key is not yours, revoke it immediately.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  9. API key rotated                                                         */
/* -------------------------------------------------------------------------- */

export function apiKeyRotatedTemplate({
    keyName,
    keyPrefix = 'apim_',
    environment = 'production',
    clientName = 'ObserveX Workspace',
    rotatedByUsername = 'Authorized User',
    timestamp,
    dashboardUrl = `${APP_URL}/admin/clients`,
}) {
    const subject = `SECURITY NOTICE: ObserveX API Key Rotated (${keyName})`;
    const preheader = `"${keyName}" in ${clientName} now has a new secret.`;
    const rows = [
        ['Key name', keyName, { bold: true }],
        ['New identifier', `${keyPrefix}••••••••`, { mono: true, color: '#D97706' }],
        ['Environment', String(environment), { upper: true }],
        ['Workspace', clientName],
        ['Rotated by', rotatedByUsername],
        ['Rotated at', timestamp || now()],
    ];

    const bodyHtml = `
      ${eyebrow('Key rotated', 'warning')}
      ${heading('API key rotated')}
      ${paragraph(`The key ${strong(keyName)} in ${strong(clientName)} was regenerated with a new secret.`)}
      ${details(rows)}
      ${button('View API keys', dashboardUrl, 'warning')}
      ${spacer(16)}
      ${callout('Action required', 'The previous key value is revoked. Update your backend services, middleware and collectors with the new key to avoid telemetry ingestion gaps.', 'warning')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml, tone: 'warning' }),
        text: buildText({
            title: `SECURITY NOTICE: API Key Rotated (${keyName})`,
            intro: `The API key "${keyName}" in workspace "${clientName}" has been regenerated.`,
            rows,
            cta: { label: 'View API keys', url: dashboardUrl },
            note: 'Action required: the previous key is immediately deactivated. Update all service configurations with the new key.',
        }),
    };
}

/* -------------------------------------------------------------------------- */
/*  10. API key revoked                                                        */
/* -------------------------------------------------------------------------- */

export function apiKeyRevokedTemplate({
    keyName,
    environment = 'production',
    clientName = 'ObserveX Workspace',
    revokedByUsername = 'Authorized User',
    timestamp,
    dashboardUrl = `${APP_URL}/admin/clients`,
}) {
    const subject = `SECURITY ALERT: ObserveX API Key Revoked (${keyName})`;
    const preheader = `"${keyName}" in ${clientName} has been revoked.`;
    const rows = [
        ['Key name', keyName, { bold: true }],
        ['Status', 'Revoked (inactive)', { color: '#DC2626', bold: true }],
        ['Environment', String(environment), { upper: true }],
        ['Workspace', clientName],
        ['Revoked by', revokedByUsername],
        ['Revoked at', timestamp || now()],
    ];

    const bodyHtml = `
      ${eyebrow('Key revoked', 'danger')}
      ${heading('API key revoked')}
      ${paragraph(`The key ${strong(keyName)} in ${strong(clientName)} has been permanently deactivated.`)}
      ${details(rows)}
      ${button('Review API keys', dashboardUrl, 'danger')}
      ${spacer(16)}
      ${callout('Traffic impact', 'Telemetry sent with this key is now rejected with HTTP 401 Unauthorized. If this was unexpected, create a new key in the dashboard right away.', 'danger')}
    `;

    return {
        subject,
        html: baseLayout({ title: subject, preheader, bodyHtml, tone: 'danger' }),
        text: buildText({
            title: `SECURITY ALERT: API Key Revoked (${keyName})`,
            intro: `The API key "${keyName}" in workspace "${clientName}" has been permanently revoked.`,
            rows,
            cta: { label: 'Review API keys', url: dashboardUrl },
            note: 'Traffic impact: services sending metrics with this key will now receive HTTP 401 Unauthorized.',
        }),
    };
}