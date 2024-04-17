```
npm install
npm run dev
```

```
npm run deploy
```


npx wrangler dev --test-scheduled

curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"


A bit less control as we'll be relying on the Cron Trigger only (e.g. no individual cronjob per stock setup)



Global cron trigger set to every weekday

That is the limitation,
A required weekly buy if any at all (no monthly)
Could add some logic and some more parameters to allow a monthly orso setup but I do not need it right now.

Initial idea was to have a separate local RPI which sets jobs based on a json schedule, which can be changes on the go for quick time editing. But feels convoluted and another point of failure introduced for what is supposed to be a small qol thing.



$$
TODO
- [ ] Maybe - Send status per dca execution? or weekly status? In case things went wrong. OR just enable it from the broker side as they already have it built-in
- [ ] Cloudflare Auth 
Maybe Durable Objects will get an free tier when it's out of Beta, then we would ahv emore granular control over the cronjobs and on entry bases

Potentially even scheduling an oneoff order, crazy right...

API reference: https://docs.alpaca.markets/reference/authentication-2 