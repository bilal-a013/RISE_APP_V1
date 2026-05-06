# Future Gmail Integration

Business Gmail: `risetutoringluton@gmail.com`

Planned approach:

- Use the Gmail API or Google Workspace API.
- Connect through OAuth rather than storing mailbox credentials.
- When sending a report, include a unique report ID or Tutor Key in the email subject/body.
- Fetch replies from Gmail threads.
- Match replies to student/report using parent email, report ID, Tutor Key, or Gmail thread ID.
- Store matched replies in `parent_replies`.
- Display matched replies inside the Reports tab.

This is intentionally not live yet. The current Reports page shows the Parent Replies placeholder only.
