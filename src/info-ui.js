export const infoPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Potato | Discord bot management</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#f7f0df;background:#0b1117;--muted:#a9adab;--line:#354148;--accent:#d79a45;--accent2:#f1c477;--good:#75d6a4;--panel:#141d22;--shadow:0 24px 80px #0009}
*{box-sizing:border-box;scroll-behavior:smooth}body{margin:0;min-height:100vh;background:radial-gradient(circle at 78% 0,#26353a 0,#0b1117 39%);overflow-x:hidden}a{color:inherit}.page{width:min(1180px,100%);margin:auto;padding:24px clamp(20px,5vw,64px) 70px}.topbar{display:flex;justify-content:space-between;align-items:center;gap:20px}.brand{display:flex;align-items:center;gap:11px;font-weight:850;letter-spacing:-.02em}.mark{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#d79a45;box-shadow:0 8px 24px #d79a4544;font-size:12px}.potato-logo{width:30px;height:30px}.topbar nav{display:flex;align-items:center;gap:18px;color:var(--muted);font-size:13px}.topbar nav a{text-decoration:none}.topbar nav a:hover{color:#fff}.button{display:inline-block;text-decoration:none;border:1px solid #45545a;background:#1a262c;color:#f7f0df;border-radius:10px;padding:11px 16px;font-size:13px;font-weight:750}.button:hover{border-color:#d79a45;background:#233137}.button.primary{background:var(--accent);border-color:var(--accent);color:#17120b}.button.primary:hover{background:var(--accent2);border-color:var(--accent2)}.hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:70px;align-items:center;padding:92px 0 80px}.eyebrow{color:var(--accent2);text-transform:uppercase;letter-spacing:.16em;font-size:11px;font-weight:850}.hero h1{max-width:670px;margin:14px 0 18px;font-size:clamp(42px,6vw,72px);line-height:.98;letter-spacing:-.06em}.hero h1 span{color:var(--accent2)}.hero-copy{max-width:560px;color:var(--muted);font-size:17px;line-height:1.65;margin:0}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.signin{padding:28px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,#1a272ce8,#10171be8);box-shadow:var(--shadow)}.signin h2{font-size:25px;margin:0 0 9px}.signin p{color:var(--muted);font-size:13px;line-height:1.6;margin:0 0 22px}.signin .button{width:100%;text-align:center}.trust{display:flex;gap:10px;align-items:center;color:#c2c2b5;font-size:11px;margin-top:16px}.trust i{width:7px;height:7px;border-radius:50%;background:var(--good);box-shadow:0 0 12px var(--good)}#features{scroll-margin-top:24px}.features{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.feature{padding:22px;border:1px solid #304047;border-radius:14px;background:#141d22aa}.feature-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;color:#17120b;background:var(--accent);margin-bottom:16px;font-weight:850}.feature h3{font-size:16px;margin:0 0 8px}.feature p{color:var(--muted);font-size:13px;line-height:1.55;margin:0}.section-title{margin:0 0 18px;font-size:12px;color:#91a0a0;text-transform:uppercase;letter-spacing:.14em;font-weight:850}@media(max-width:780px){.hero{grid-template-columns:1fr;gap:35px;padding:65px 0 55px}.features{grid-template-columns:1fr}.topbar nav a:not(.button){display:none}}@media(max-width:480px){.page{padding-left:16px;padding-right:16px}.hero h1{font-size:45px}.topbar nav{gap:8px}.topbar nav .button{padding:9px 11px}}
</style>
</head>
<body>
<div class="page">
  <header class="topbar">
    <a class="brand" href="/"><span class="mark"><svg class="potato-logo" viewBox="0 0 32 32" aria-hidden="true"><path fill="#8d5d2e" d="M8 5c5-4 14-2 17 4 3 7 0 17-7 19-7 2-14-1-16-8C0 13 3 8 8 5Z"/><path fill="#d9a15b" d="M9 7c4-3 11-2 14 3 2 5 0 13-5 15-5 2-11-1-12-6-2-5-1-9 3-12Z"/><circle cx="12" cy="14" r="1.5" fill="#332318"/><circle cx="21" cy="13" r="1.5" fill="#332318"/><path d="M13 19c2 2 5 2 7 0" fill="none" stroke="#332318" stroke-width="1.5" stroke-linecap="round"/></svg></span><span>Potato</span></a>
    <nav><a href="#features">Features</a><a class="button" href="/auth/login">Sign in with Discord</a></nav>
  </header>
  <main>
    <section class="hero">
      <div>
        <div class="eyebrow">Discord server operations</div>
        <h1>Run your server with <span>confidence.</span></h1>
        <p class="hero-copy">Server Control brings moderation, protection, welcome messages, tickets, logs, leveling, and community tools into one calm control center.</p>
        <div class="hero-actions"><a class="button primary" href="/auth/login">Start with Discord</a><a class="button" href="#features">See what is included</a></div>
      </div>
      <aside class="signin">
        <div class="eyebrow">Admin access</div>
        <h2>Your server, one dashboard.</h2>
        <p>Sign in with Discord to see the servers where you are an administrator and the bot is installed. No extra account or password is needed.</p>
        <a class="button primary" href="/auth/login">Sign in with Discord</a>
        <div class="trust"><i></i> Secure Discord OAuth sign-in</div>
      </aside>
    </section>
    <section id="features">
      <h2 class="section-title">Everything your community needs</h2>
      <div class="features">
        <article class="feature"><div class="feature-icon">M</div><h3>Moderation that scales</h3><p>Manage commands, warnings, automod, raid protection, blacklists, and audit logs from one place.</p></article>
        <article class="feature"><div class="feature-icon">C</div><h3>Community experiences</h3><p>Welcome members, publish tickets, build self-assignable roles, and keep engagement moving with XP and rewards.</p></article>
        <article class="feature"><div class="feature-icon">S</div><h3>Simple server setup</h3><p>Use guided setup and server-aware controls that work with the channels and roles already in your Discord.</p></article>
      </div>
    </section>
  </main>
</div>
</body>
</html>`;
