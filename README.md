# Web application frontend FYP (EyeSecure)
Web application frontend used on my final year project to the University of Oviedo
Current version: 2.1.1

## Scope
This project comprises the creation of a client-server application that enables centralized user browsing behavior management on a per-user basis, also considering establishing different restrictions by time period. This means that the application may impose browsing restrictions and limits (based on whitelists of allowed pages and blacklists of disallowed ones, but not excluding other approaches like page content limitation and centralized browser settings per user and slot time) to certain users or groups of users depending on their known schedule. Therefore, users may have these restrictions enabled during certain hours only (for example, work hours, hours in which they deal with critical systems, exam hours…) and be free to browse on others.
This application is thought as a complement, not a replacement, to other browsing filtering solutions, and aimed to be deployed in environments where there are many client machines whose users may have different browsing restrictions. The restrictions may be configured on the server according to a series of rule (that consider dates and times), so they can be established in a centralized way by a company or institution. The application is planned as a web browser extension. Requests are processed by this extension on each client, so the filtering computing costs are distributed over them. This enables efficient per-user browsing limitation policies depending on time and date periods configured by an administrator. Administrators are also warned of illegal browsing or extension bypass attempts to detect rogue user actions. The client-server application code has also been designed with an extensive list of security controls and checks to ensure that clients cannot bypass or disable it easily.

## Innovative aspects
The main contribution of this project is to show how a client-server application can be deployed to enable per-user fine-grained and time-constrained browsing restrictions while being highly resistant to attacks,not only at the client side, but in the whole application infrastructure. Restrictions and their violation attempts are managed centrally but enforced on the client machine only to the users that could be affected by them. This allows efficient and flexible user browsing restriction enforcement, and real-time warning management about unauthorized browsing attempts.
Although perfect security can never be achieved, the embedded protection mechanisms forces malicious users to have a high technical knowledge and invest a considerable amount of time to try to disable it, making it highly infeasible in several deployment scenarios.

## Docs
The documentation of the project is available on PDF format and the Spanish language, but it will be available in English as soon as possible.
Some of the files indicated on the documentation file are not available due to privacy policies.

## Backend and administrator frontend
[Backend and administrator frontend](https://github.com/acg96/apiTFG)



**The MIT License**

Copyright (c) 2020 Andrés Casillas García

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.