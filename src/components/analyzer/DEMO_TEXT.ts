/**
 * Стартовий текст аналізатора — ті самі тексти, що розбираються в темах:
 * інцидент із «Минулих часів», ранковий апдейт із «Теперішніх» і плани на
 * тиждень для майбутніх. Разом вони дають усі девʼять конструкцій, тому людина,
 * яка відкрила аналізатор уперше, бачить кожен перемикач у дії, а не третину.
 *
 * Останній абзац навмисно тримає обидві пастки майбутнього: `will` поруч із
 * теперішніми формами, що говорять про майбутнє («while it deploys», «if it
 * fails»), і `going to` поруч із буквальним рухом.
 */
export const DEMO_TEXT = `Yesterday at 11 p.m. the pager went off. I was watching a film, so I paused it and opened my laptop. Production was down. It turned out that a junior dev had pushed a migration straight to main two hours earlier and nobody had reviewed it. While I was rolling back the migration, my CTO called. By the time we restored the service, we had lost about forty minutes of traffic.

Later that week I wrote a post-mortem. I had never seen that error before, so I tracked down the root cause and added monitoring. If we had added it earlier, we would have caught the problem in ten minutes.

This morning the picture is different. The migration is still running — it has been going for about three hours, which is longer than we expected. I have already checked the logs twice and I don't see any errors, so I think it is just slow. The vendor hasn't replied to my email yet, so I am escalating it today. I usually run the release, but this week I am handing it over to a colleague, because I am on call.

Tomorrow we will run the migration again, and this time I will be watching the dashboard while it deploys. By Friday we will have shipped the fix. If it fails again, I am going to escalate it to the vendor — but I am going to the office first, so call me before nine.`;
