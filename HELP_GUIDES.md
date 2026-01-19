# ClassABC — Per-Page User Guide

This document summarizes user-facing instructions for each page in the app. It's intended for teachers, parents, and students — short, actionable steps with minimal developer jargon.

---

## Landing

What it is

- The public entry page for signing in and opening student/parent portals.

How to use

- Teachers: Click **Login** → enter email/password. New? Click **Get Started Free**.
- Students: Choose **Student** role and enter the 5-digit code from your teacher.
- Parents: Choose **Parent** and enter your 5-digit parent code.

---

## Teacher Portal

What it is

- Your classroom hub where you create, edit, and open classes.

How to use

- Add Class: Click **Add Class** and complete the form.
- Open Class: Click a class card to open that classroom dashboard.
- Edit/Delete: Hover a class card, then use the edit or trash icons.

---

## Class Dashboard

What it is

- The primary teacher workspace for managing students and daily classroom activities.

How to use (high-level)

- Award points: Click a student card to open behavior options and give points.
- Whole class points: Click the **Whole Class** card to award everyone.
- Lucky Draw: Open the dice icon to pick random winners.
- Attendance: Toggle attendance mode, then click students to mark Absent/Tardy.
- Sidebar: Use it to access Assignments, Inbox, Access Codes, Reports, Timer, Whiteboard, and Settings.

---

## Assignments

What it is

- Create and publish worksheets to students.

How to use

- Add questions using the left sidebar (Short answer, MCQ, Matching, Story).
- Attach images to questions with the image button.
- Assign to All or Select students and click **Publish to Class**.

---

## Inbox (Submissions)

What it is

- Where submitted student work appears for review and grading.

How to use

- Select a pending submission to open it.
- Enter a grade in the field and click **Save Grade & Send**.

---

## Settings

What it is

- Configure behavior cards, student roster, and class options.

How to use

- Add/Edit/Delete behavior cards in the Behavior Cards tab.
- Edit student names and avatars in Students tab.
- Reset to defaults to restore starter cards.

---

## Reports

What it is

- Charts and teacher notes summarizing student/class activity.

How to use

- Choose a time range (Week / Month / Year).
- Select a student or view the whole class.
- Copy the teacher note for parent communication.

---

## Whiteboard

What it is

- A simple drawing and typing canvas for lessons.

How to use

- Choose a tool (pencil, highlighter, text, eraser) from the right toolbar.
- Use the color picker and size selector to adjust strokes.
- Click **Export PNG** to download the board as an image.

---

## Access Codes

What it is

- Shows each student's Parent Code and Student Code for portal access.

How to use

- Copy a code to give to a parent or student device.

---

## Parent Portal

What it is

- A read-only view parents open using a 5-digit parent code to see their child's report.

How to use

- Enter your 5-digit parent code and view the child’s Reports page.

---

## Student Portal

What it is

- Student-facing area accessed with a 5-digit student code to view and complete assignments.

How to use

- Open an assignment to answer questions.
- Completed work is stored locally and marked complete.

---

If you want these guides displayed inside the app as inline help buttons, I can wire them next (I'll add a compact inline help modal and place help icons near each page header). Done: `src/help_guides.js` contains the canonical per-page help objects used by the inline help UI.
