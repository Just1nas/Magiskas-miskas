import { writeFile } from 'node:fs/promises';
import { fetchTicketSchedule } from '../server/ticket-schedule.js';
try {
  const events = await fetchTicketSchedule();
  await writeFile(new URL('../src/ticket-events.json', import.meta.url), JSON.stringify(events, null, 2) + '\n');
  console.log(`Updated ${events.length} ticket dates from Bilietai.lt.`);
} catch (error) {
  console.warn(`Could not refresh ticket schedule; retaining last verified dates: ${error.message}`);
  if (process.argv.includes('--strict')) process.exitCode = 1;
}
